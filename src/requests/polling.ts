import { RequestResponse, FetcherOptions, RequestOptions } from '../types';
import { FetcherRequest, createAbortError, RequestControl, PromiseResolve } from './utils';

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

        // start polling

        return this.response;
    }
    abort(): void {
        if (this.isAborted) {
            return;
        }

        this.isAborted = true;
    }
}
