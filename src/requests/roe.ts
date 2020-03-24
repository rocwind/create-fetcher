import { RequestResponse, FetcherOptions, RequestOptions } from '../types';
import { FetcherRequest, createAbortError, RequestControl } from './utils';

/**
 * ROE request, handles request with retries
 */
export class ROEFetcherRequest<T, R> implements FetcherRequest<T> {
    private retriedTimes = 0;
    constructor(
        private requestControl: RequestControl<T, R>,
        private cacheKey: string,
        private options: FetcherOptions<T> & RequestOptions<T>,
        private request?: R,
    ) {}

    run(): Promise<RequestResponse<T>> {
        // TODO: use swr for first request
        return Promise.resolve({});
    }
    abort(): void {}
}
