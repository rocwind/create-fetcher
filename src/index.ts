import { RequestCreator, FetcherOptions, Fetcher } from './types';
import { FetcherImpl } from './fetcher';

export * from './types';

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
