import { RequestResponse, Fetcher, CacheMode } from './types';

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
        fetcher.fetch(request, { cacheMode: CacheMode.NoStore }).response.then((res) => res.data);
}
