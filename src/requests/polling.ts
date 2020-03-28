import { RequestResponse, FetcherOptions, RequestOptions, CacheMode } from '../types';
import {
    FetcherRequest,
    createAbortError,
    RequestControl,
    PromiseResolve,
    createPromise,
    proxyResponseWithAdditionalNext,
} from './utils';
import { ROEFetcherRequest } from './roe';
import { SWRFetcherRequest } from './swr';

/**
 * Polling request, handles client polling
 */
export class PollingFetcherRequest<T, R> implements FetcherRequest<T> {
    private innerRequest: FetcherRequest<T>;
    private isAborted = false;
    private response: Promise<RequestResponse<T>>;
    private responseResolve: PromiseResolve<RequestResponse<T>>;
    private pollingTimeout: ReturnType<typeof setTimeout>;

    constructor(
        private requestControl: RequestControl<T, R>,
        private cacheKey: string,
        private options: FetcherOptions<T> & RequestOptions<T>,
        private request?: R,
    ) {}

    run(): Promise<RequestResponse<T>> {
        if (this.response) {
            return this.response;
        }

        const responseControls = createPromise<RequestResponse<T>>();
        this.response = responseControls.promise;
        this.responseResolve = responseControls.resolve;

        let isFirstRequest = true;
        const optionsWithNoCache = Object.assign({}, this.options, {
            cacheMode: CacheMode.NoCache,
        });
        const pollingLoop = (): void => {
            clearTimeout(this.pollingTimeout);

            // first request may uses cache while followed requests doesn't need cache
            const options = isFirstRequest ? this.options : optionsWithNoCache;
            isFirstRequest = false;

            this.innerRequest = this.options.retryOnError
                ? new ROEFetcherRequest(this.requestControl, this.cacheKey, options, this.request)
                : new SWRFetcherRequest(this.requestControl, this.cacheKey, options, this.request);

            this.innerRequest.run().then(response => {
                // this.responseResolve might be replaced inside the creating proxy response method
                const resolve = this.responseResolve;

                if (this.isAborted) {
                    resolve(createAbortError());
                    return;
                }

                const proxied = proxyResponseWithAdditionalNext(response, () => {
                    if (this.isAborted) {
                        return;
                    }

                    const promiseControls = createPromise<RequestResponse<T>>();
                    this.responseResolve = promiseControls.resolve;
                    this.pollingTimeout = setTimeout(
                        pollingLoop,
                        this.options.pollingWaitTime * 1000,
                    );

                    return promiseControls.promise;
                });
                resolve(proxied);
            });
        };
        // start polling
        pollingLoop();
        return this.response;
    }

    abort(): void {
        if (this.isAborted) {
            return;
        }

        this.isAborted = true;

        this.innerRequest?.abort();
        this.responseResolve?.(createAbortError());
        clearTimeout(this.pollingTimeout);
    }
}
