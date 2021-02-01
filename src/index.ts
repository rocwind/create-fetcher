import { RequestCreator, FetcherOptions, Fetcher } from './types';
import { FetcherImpl } from './fetcher';

export * from './types';
export * from './utils';

/**
 * create a fetcher according to given request creator and options
 * @param requestCreator
 * @param options
 */
export const createFetcher = <T, R = void>(
    requestCreator: RequestCreator<T, R>,
    options: FetcherOptions,
): Fetcher<T, R> => {
    return new FetcherImpl(requestCreator, options);
};
