/**
 * Cache mode
 */
enum CacheMode {
    /**
     * use local cache if it is not expired, and load from network if it is no longer fresh
     */
    Default = 0,
    /**
     * totally ignore cache, load from network and not store result to cache
     */
    NoStore = 1,
    /**
     * load from network no matter there is local cache or not and store result to cache
     */
    NoCache = 3,
    /**
     * use local cache if it exists, , otherwise load from network and store result to cache
     */
    ForceCache = 4,
    /**
     * use local cache result, throw errors on cache miss
     */
    OnlyIfCached = 5,
}

/**
 *
 */
interface FetcherOptions {
    /**
     * default cache mode
     */
    cacheMode: CacheMode;
    cacheKeyPrefix?: string;
    /**
     * cache will still be fresh for at least the specified number of seconds
     */
    cacheMinFresh?: number;
    /**
     * max amount of time of a cache is considered fresh
     */
    cacheMaxAge?: number;
}

type RequestOptions = Omit<FetcherOptions, 'cacheKeyPrefix' | 'cacheMinFresh' | 'cacheMaxAge'> & {
    /**
     * override default cache key
     */
    cacheKey?: string;
    /**
     *
     */
    pollingInterval?: number;
    /**
     *
     */
    shouldRetryOnError?: boolean;
};

/**
 *
 */
interface FetcherResponse<T> {
    /**
     * data returned by request
     */
    data?: T;
    /**
     * followed up response. swr, polling
     */
    next?: Promise<FetcherResponse<T>>;
    error?: Error;
}

/**
 *
 */
interface FetcherReturn<T> {
    abort: () => void;
    response: Promise<FetcherResponse<T>>;
}

/**
 *
 */
interface Fetcher<T, R = void> {
    (request?: R, options?: RequestOptions): FetcherReturn<T>;
}

/**
 *
 */
type RequestCreator<T, R = void> = (request?: R) => Promise<T>;

/**
 *
 * @param requestCreator
 * @param options
 */
export const createFetcher = <T, R = void>(
    requestCreator: RequestCreator<T, R>,
    options: FetcherOptions,
): Fetcher<T, R> => {
    return () => ({
        abort: () => {},
        response: Promise.resolve({}),
    });
};
