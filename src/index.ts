import { RequestCreator, FetcherOptions, Fetcher } from './types';
import { FetcherImpl } from './fetcher';

export * from './types';
export * from './utils';

/**
 *
 * @param requestCreator
 * @param options
 */
export const createFetcher = <T, R = void>(
    requestCreator: RequestCreator<T, R>,
    options: FetcherOptions<T>,
): Fetcher<T, R> => {
    return new FetcherImpl(requestCreator, options);
};
