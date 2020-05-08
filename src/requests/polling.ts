import { RequestResponse, CacheMode, Logger } from '../types';
import {
    FetcherRequest,
    createAbortError,
    RequestControl,
    PromiseResolve,
    createPromise,
    proxyResponseWithAdditionalNext,
    FetcherRequestOptions,
} from './utils';
import { ROEFetcherRequest } from './roe';
import { SWRFetcherRequest } from './swr';

/**
 * Polling request, handles client polling
 */
export class PollingFetcherRequest<T, R> implements FetcherRequest<T> {
    private innerRequest: FetcherRequest<T>;
    private isAborted = false;
    private responseResolve: PromiseResolve<RequestResponse<T>>;
    private pollingTimeout: ReturnType<typeof setTimeout>;

    constructor(
        private requestControl: RequestControl<T, R>,
        private cacheKey: string,
        private options: FetcherRequestOptions<T>,
        private request?: R,
        private logger?: Logger,
    ) {}

    run(): Promise<RequestResponse<T>> {
        const responseControls = createPromise<RequestResponse<T>>();
        this.responseResolve = responseControls.resolve;

        let isFirstRequest = true;
        const optionsWithNoCache = Object.assign({}, this.options, {
            cacheMode: CacheMode.NoCache,
        });
        const pollingLoop = (): void => {
            this.logger?.('start polling');
            clearTimeout(this.pollingTimeout);

            // first request may uses cache while followed requests doesn't need cache
            const options = isFirstRequest ? this.options : optionsWithNoCache;
            isFirstRequest = false;

            this.innerRequest = this.options.retryOnError
                ? new ROEFetcherRequest(
                      this.requestControl,
                      this.cacheKey,
                      options,
                      this.request,
                      this.logger,
                  )
                : new SWRFetcherRequest(
                      this.requestControl,
                      this.cacheKey,
                      options,
                      this.request,
                      this.logger,
                  );

            this.innerRequest.run().then((response) => {
                // this.responseResolve might be replaced inside the creating proxy response method
                const resolve = this.responseResolve;

                if (this.isAborted) {
                    resolve(createAbortError());
                    return;
                }

                resolve(
                    proxyResponseWithAdditionalNext(response, () => {
                        this.logger?.('polling request settled');
                        if (this.isAborted) {
                            return;
                        }

                        const promiseControls = createPromise<RequestResponse<T>>();
                        this.responseResolve = promiseControls.resolve;

                        this.pollingTimeout = setTimeout(
                            pollingLoop,
                            this.options.pollingWaitTime * 1000,
                        );
                        this.logger?.('next polling scheduled');

                        return promiseControls.promise;
                    }),
                );
            });
        };
        // start polling
        pollingLoop();
        return responseControls.promise;
    }

    abort(): void {
        if (this.isAborted) {
            return;
        }
        this.isAborted = true;
        this.logger?.('aborted');

        this.innerRequest?.abort();
        this.responseResolve?.(createAbortError());
        clearTimeout(this.pollingTimeout);
    }
}
