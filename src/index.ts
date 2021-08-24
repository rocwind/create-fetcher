import { RequestCreator, FetcherOptions, Fetcher, RequestContext } from './types';
import { FetcherImpl } from './fetcher';

export * from './types';
export * from './utils';

/**
 * create a fetcher for url with default options
 * @param url
 * @param options
 */
export function createFetcher<T>(
    url: string,
    options?: FetcherOptions,
): Fetcher<T, RequestInit | void>;
/**
 * create a fetcher according to given request creator and options
 * @param requestCreator
 * @param options
 */
export function createFetcher<T, R = void>(
    requestCreator: RequestCreator<T, R>,
    options: FetcherOptions,
): Fetcher<T, R>;

export function createFetcher<T, R = void>(
    requestCreatorOrURL: RequestCreator<T, R> | string,
    options?: FetcherOptions,
): Fetcher<T, R> {
    if (typeof requestCreatorOrURL === 'string') {
        return new FetcherImpl(
            (requestInit: RequestInit, context: RequestContext) =>
                fetch(requestCreatorOrURL, Object.assign({}, requestInit, context)).then(
                    // TODO: check content-type?
                    (response) => response.json(),
                ),
            options,
        );
    }
    return new FetcherImpl(requestCreatorOrURL, options);
}
