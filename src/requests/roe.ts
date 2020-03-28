import { RequestResponse, BackoffMode, CacheMode, Logger } from '../types';
import {
    FetcherRequest,
    createAbortError,
    RequestControl,
    createPromise,
    proxyResponseWithAdditionalNext,
    AbortErrorName,
    PromiseResolve,
    FetcherRequestOptions,
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
        private options: FetcherRequestOptions<T>,
        private request?: R,
        private logger?: Logger,
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
            this.logger,
        );
        this.innerRequest.run().then(response => {
            if (this.isAborted) {
                responseControls.resolve(createAbortError());
                return;
            }

            const proxied = proxyResponseWithAdditionalNext(response, ({ error }) => {
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
                    this.logger?.('start retry');
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
                                this.logger?.('run out retry times');
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
                this.logger?.('retry scheduled');
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
        this.logger?.('aborted');

        this.responseResolve?.(createAbortError());
        this.innerRequest?.abort();
        this.retryControl.reset();
    }
}

class RetryControl<T> {
    private retriedTimes = 0;
    private retryTimeout: ReturnType<typeof setTimeout>;
    constructor(private options: FetcherRequestOptions<T>) {
        this.reset();
    }

    reset(): void {
        clearTimeout(this.retryTimeout);
        this.retriedTimes = 0;
    }

    canRetry(): boolean {
        return this.retriedTimes < this.options.retryTimes;
    }

    retry(callback: () => void): void {
        if (!this.canRetry()) {
            return;
        }
        clearTimeout(this.retryTimeout);

        let nextRetryWaitTime: number;
        switch (this.options.retryBackoff) {
            case BackoffMode.JitteredExponential:
                nextRetryWaitTime =
                    this.options.retryInitialWaitTime * randomBetween(1, 2 ** this.retriedTimes);
                break;
            case BackoffMode.Exponential:
                nextRetryWaitTime = this.options.retryInitialWaitTime * 2 ** this.retriedTimes;
                break;
            case BackoffMode.Constant:
            default:
                nextRetryWaitTime = this.options.retryInitialWaitTime;
                break;
        }
        // cap retry wait time by max wait time
        nextRetryWaitTime = Math.min(
            nextRetryWaitTime,
            this.options.retryMaxWaitTime ?? Number.MAX_VALUE,
        );

        this.retryTimeout = setTimeout(callback, nextRetryWaitTime * 1000);
        this.retriedTimes += 1;
    }
}

function randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
}
