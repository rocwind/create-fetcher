import hash from 'object-hash';
import {
    Fetcher,
    RequestCreator,
    FetcherOptions,
    CacheMode,
    RequestOptions,
    RequestResponse,
    Cache,
} from './types';
import { createMemoryCache } from './caches/memory';
import { KeyPrefixHelper } from './caches/utils';
import { FetcherRequest } from './request';

const defaultOptions: FetcherOptions<any> = {
    cache: createMemoryCache(),
    cacheMode: CacheMode.Default,
    cacheMaxAge: 3600,
    cacheMinFresh: 1,
};

export class FetcherImpl<T, R = void> implements Fetcher<T, R> {
    private options = Object.assign({}, defaultOptions);
    private requestByKey = new Map<string, FetcherRequest<T, R>>();
    constructor(private requestCreator: RequestCreator<T, R>, options: FetcherOptions<T>) {
        this.config(options);
    }

    config(options) {
        Object.assign(this.options, options);
    }

    clearCache(cache?: Cache<any>) {
        const cacheToClear = cache ?? this.options.cache;
        const prefixHelper = new KeyPrefixHelper(this.options.cacheKeyPrefix);
        return cacheToClear
            .getKeys()
            .then(keys =>
                Promise.all(
                    keys
                        .filter(key => prefixHelper.matchPrefix(key))
                        .map(key => cacheToClear.remove(key)),
                ),
            ) as Promise<void>;
    }

    fetch(request: R, options?: RequestOptions<T>) {
        const mergedOptions = Object.assign({}, this.options, options);
        const cacheKey = options?.cacheKey ?? hash(request ?? null);
        if (!this.requestByKey.has(cacheKey)) {
            this.requestByKey.set(
                cacheKey,
                new FetcherRequest(cacheKey, request, this.requestCreator, mergedOptions),
            );
        }
        const fetcherRequest = this.requestByKey.get(cacheKey);
        const response = fetcherRequest.run();
        // remove request from running map once it's fully settled
        const onRequestSettled = ({ next }: RequestResponse<T>): void => {
            if (next) {
                next.then(onRequestSettled);
            } else {
                this.requestByKey.delete(cacheKey);
            }
        };
        response.then(onRequestSettled);
        return {
            abort: () => {
                // TODO: if request shared by multiple client,
                // one client abort will cause others receive the abort error too
                fetcherRequest.abort();
            },
            response,
        };
    }
}
