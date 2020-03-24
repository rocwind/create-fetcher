import hash from 'object-hash';
import { FetcherOptions, RequestOptions, RequestCreator, RequestResponse } from '../types';
import { FetcherRequest } from './utils';
import { SWRFetcherRequest } from './swr';

export class RequestFactory<T, R> {
    private requestByKey = new Map<string, FetcherRequest<T, R>>();

    constructor(private requestCreator: RequestCreator<T, R>) {}

    getRequest(options: FetcherOptions<T> & RequestOptions<T>, request?: R): FetcherRequest<T, R> {
        const cacheKey = options?.cacheKey ?? hash(request ?? null);

        if (this.requestByKey.has(cacheKey)) {
            return this.requestByKey.get(cacheKey);
        }

        const fetcherRequest = new SWRFetcherRequest(
            cacheKey,
            this.requestCreator,
            options,
            request,
        );
        this.requestByKey.set(cacheKey, fetcherRequest);

        // remove request from running map once it's fully settled
        const onRequestSettled = ({ next }: RequestResponse<T>): void => {
            if (next) {
                next.then(onRequestSettled);
            } else {
                this.requestByKey.delete(cacheKey);
            }
        };
        fetcherRequest.run().then(onRequestSettled);
        return fetcherRequest;
    }
}
