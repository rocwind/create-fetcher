import { RequestResponse, Fetcher, CacheMode, Cache, CachedData } from './types';

export type ResponseHandler<T> = (response: RequestResponse<T>) => void;
/**
 * helper for handle each fetcher.fetch() response
 * @param handler
 */
export function forEachResponse<T>(handler: ResponseHandler<T>): ResponseHandler<T> {
    const forEachHandler: ResponseHandler<T> = (response) => {
        handler(response);
        response.next?.then(forEachHandler);
    };

    return forEachHandler;
}

export type PureFetch<T, R = void> = (request?: R) => Promise<T>;
/**
 * fallback to a pure fetch function, which uses no cache store and return plain promise wrapped response
 * @param fetcher
 */
export function fallbackToPureFetch<T, R = void>(fetcher: Fetcher<T, R>): PureFetch<T, R> {
    return (request) =>
        fetcher
            .fetch(request, { cacheMode: CacheMode.NoStore })
            .response.then(({ data, error }) => {
                if (error) {
                    throw error;
                }
                return data;
            });
}

/**
 * clear cache
 * @param cache cache to be cleared
 * @param maxAge only keys older than max age will be cleared if maxAge set
 */
export function clearCache<T>(cache: Cache<CachedData<T>>, maxAge?: number): Promise<void> {
    return cache.getKeys().then((keys) =>
        Promise.all(
            keys.map((key) => {
                if (maxAge > 0) {
                    return cache.get(key).then((data) => {
                        // cache is valid
                        if (data?.timestamp + maxAge * 1000 > Date.now()) {
                            return;
                        }
                        return cache.remove(key);
                    });
                }
                return cache.remove(key);
            }),
        ),
    ) as Promise<void>;
}
