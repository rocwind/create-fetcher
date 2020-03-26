import { RequestResponse, FetcherOptions, RequestOptions } from '../types';
import { FetcherRequest, createAbortError, RequestControl } from './utils';

/**
 * Polling request, handles client polling
 */
export class PollingFetcherRequest<T, R> implements FetcherRequest<T> {
    constructor(
        private requestControl: RequestControl<T, R>,
        private cacheKey: string,
        private options: FetcherOptions<T> & RequestOptions<T>,
        private request?: R,
    ) {}

    run(): Promise<RequestResponse<T>> {
        // TODO: polling is not supported yet
        return Promise.resolve({
            error: new Error('not implemented'),
        });
    }
    abort(): void {}
}
