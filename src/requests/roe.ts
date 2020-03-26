import { RequestResponse, FetcherOptions, RequestOptions, BackoffMode, CacheMode } from '../types';
import {
    FetcherRequest,
    createAbortError,
    RequestControl,
    createPromise,
    proxyResponseWithAdditionalNext,
    AbortErrorName,
    PromiseResolve,
} from './utils';
import { SWRFetcherRequest } from './swr';

/**
 * ROE request, handles request with retries
 */
export class ROEFetcherRequest<T, R> implements FetcherRequest<T> {
    private retryControl: RetryControl<T>;
    private innerRequest: FetcherRequest<T>;
    private isAborted = false;
    private response: Promise<RequestResponse<T>>;
    private responseResolve: PromiseResolve<RequestResponse<T>>;

    constructor(
        private requestControl: RequestControl<T, R>,
        private cacheKey: string,
        private options: FetcherOptions<T> & RequestOptions<T>,
        private request?: R,
    ) {
        this.retryControl = new RetryControl(options);
    }

    run(): Promise<RequestResponse<T>> {
        if (this.response) {
            return this.response;
        }

        const responseControls = createPromise();
        this.response = responseControls.promise;
        // for abort call to resolve abort error
        this.responseResolve = responseControls.resolve;

        // use swr for first request
        this.innerRequest = new SWRFetcherRequest(
            this.requestControl,
            this.cacheKey,
            this.options,
            this.request,
        );
        this.innerRequest.run().then(res => {
            if (this.isAborted) {
                responseControls.resolve(createAbortError());
                return;
            }

            const proxied = proxyResponseWithAdditionalNext(res, ({ error }) => {
                if (
                    this.isAborted ||
                    !error ||
                    error.name === AbortErrorName ||
                    !this.retryControl.canRetry()
                ) {
                    return;
                }

                // start retry
                const nextControls = createPromise<RequestResponse<T>>();
                // to let abort work on next promise
                this.responseResolve = nextControls.resolve;

                const retryLoop = () => {
                    // do retry
                    this.innerRequest = new SWRFetcherRequest(
                        this.requestControl,
                        this.cacheKey,
                        // no cache for these requests - but saves result to cache
                        Object.assign({}, this.options, { cacheMode: CacheMode.NoCache }),
                        this.request,
                    );
                    this.innerRequest.run().then(({ data, error }) => {
                        if (this.isAborted || error?.name === AbortErrorName) {
                            nextControls.resolve(createAbortError());
                            return;
                        }
                        if (error) {
                            if (!this.retryControl.canRetry()) {
                                // no retry times, resolve error
                                nextControls.resolve({ error });
                                return;
                            }
                            this.retryControl.retry(retryLoop);
                            return;
                        }

                        nextControls.resolve({ data });
                    });
                };
                this.retryControl.retry(retryLoop);

                return nextControls.promise;
            });

            responseControls.resolve(proxied);
        });

        return this.response;
    }

    abort(): void {
        if (this.isAborted) {
            return;
        }
        this.isAborted = true;

        if (this.responseResolve) {
            this.responseResolve(createAbortError());
        }
        if (this.innerRequest) {
            this.innerRequest.abort();
        }
        this.retryControl.reset();
    }
}

class RetryControl<T> {
    private retriedTimes = 0;
    private nextRetryWaitTime = 0;
    private retryTimeout: ReturnType<typeof setTimeout>;
    constructor(private options: RequestOptions<T>) {
        this.reset();
    }

    reset(): void {
        clearTimeout(this.retryTimeout);
        this.retriedTimes = 0;
        this.nextRetryWaitTime = this.options.retryInitialWaitTime;
    }

    canRetry(): boolean {
        return this.retriedTimes < this.options.retryTimes;
    }

    retry(callback: () => void): void {
        if (!this.canRetry()) {
            return;
        }
        clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(callback, this.nextRetryWaitTime * 1000);
        this.retriedTimes += 1;
        switch (this.options.retryBackoff) {
            case BackoffMode.Exponential:
                this.nextRetryWaitTime *= 2;
                break;
            case BackoffMode.Constant:
            default:
                break;
        }
    }
}
