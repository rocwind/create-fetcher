import { createPromise } from './requests/utils';
import { RequestResponse, RequestReturn, Fetcher, CacheMode, Cache, CachedData } from './types';

export type ResponseHandler<T> = (response: RequestResponse<T>) => void;
/**
 * helper for handle each fetcher.fetch() response
 * @param requestReturn the fetcher.fetch() request return
 * @param handler handle that deal with each response
 * @returns abort function that can abort this request
 */
export function forEachResponse<T>(
    requestReturn: RequestReturn<T>,
    handler: ResponseHandler<T>,
): () => void {
    const forEachHandler: ResponseHandler<T> = (response) => {
        handler(response);
        response.next?.then(forEachHandler);
    };
    requestReturn.response.then(forEachHandler);
    return requestReturn.abort;
}

/**
 * helper for handle each fetcher.fetch() response
 * and returns the latest data it receives after all responses settled
 * @param requestReturn
 */
export function getFinalResponse<T>(requestReturn: RequestReturn<T>): Promise<T> {
    const { promise, resolve, reject } = createPromise<T>();
    let latestData: T;
    let lastError: Error;
    forEachResponse(requestReturn, ({ data, error, next }) => {
        if (data !== undefined) {
            latestData = data;
        }
        if (error) {
            lastError = error;
        }
        if (!next) {
            if (latestData !== undefined) {
                resolve(latestData);
            } else {
                reject(lastError);
            }
        }
    });
    return promise;
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
