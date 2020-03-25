/**
 * Cache
 */
export interface Cache<T> {
    /**
     * get cached data
     * @param key
     */
    get(key: string): Promise<T | undefined>;
    /**
     * set data to cache
     * @param key
     * @param value
     */
    set(key: string, value: T): Promise<void>;
    /**
     * remove cache key
     * TODO: might need a multi-key version for better performance
     * @param key
     */
    remove(key: string): Promise<void>;
    /**
     * get all cache keys by this cache
     */
    getKeys(): Promise<string[]>;
    /**
     * clear all cache keys
     */
    clear(): Promise<void>;
}

/**
 * Cache mode
 * inspired by: https://javascript.info/fetch-api#cache
 */
export enum CacheMode {
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
     * use local cache if it exists, even it's expired, otherwise load from network and store result to cache
     */
    ForceCache = 4,
    /**
     * use local cache result, event it's expired
     */
    OnlyIfCached = 5,
}

export enum BackoffMode {
    /**
     * constant backoff, use the same wait time constantly
     */
    Constant = 0,
    /**
     * exponential backoff, increase wait time for each retry
     */
    Exponential = 1,
}

export interface CachedData<T> {
    data: T;
    /**
     * data received timestamp
     */
    timestamp: number;
}

/**
 * Options for fetcher
 */
export interface FetcherOptions<T> {
    /**
     * cache, default to memory cache
     */
    cache?: Cache<CachedData<T>>;
    /**
     * cache mode, default to CacheMode.Default
     */
    cacheMode?: CacheMode;
    /**
     * key prefix
     */
    cacheKeyPrefix?: string;
    /**
     * cache will still be fresh for at least the specified number of seconds, default to 1s
     */
    cacheMinFresh?: number;
    /**
     * max amount of time of a cache is considered fresh, default to 3600s
     */
    cacheMaxAge?: number;
}

/**
 * Options for one time fetcher request, it overrides fetch options if there is any conflicts
 */
export type RequestOptions<T> = Omit<
    FetcherOptions<T>,
    'cacheKeyPrefix' | 'cacheMinFresh' | 'cacheMaxAge'
> & {
    /**
     * override default cache key
     */
    cacheKey?: string;
    /**
     * turn on retry on error or not, default is false
     */
    retryOnError?: boolean;
    /**
     * max retry times, default is 3
     */
    retryTimes?: number;
    /**
     * backoff algorithm for retry wait interval, default is BackoffMode.Constant
     */
    retryBackoff?: BackoffMode;
    /**
     * initial wait time for retry in seconds, default is 1s
     */
    retryInitialWaitTime?: number;
    /**
     * polling interval
     * TODO: not supported yet
     */
    pollingInterval?: number;
};

/**
 * Response data structure for a fetch request
 */
export interface RequestResponse<T> {
    /**
     * data returned by request
     */
    data?: T;
    /**
     * followed up response. swr, polling
     */
    next?: Promise<RequestResponse<T>>;
    /**
     * errors won't be Promise reject but resolved with error here
     */
    error?: Error;
}

/**
 *
 */
export interface RequestReturn<T> {
    /**
     * abort current request
     */
    abort: () => void;
    /**
     * response promise
     */
    response: Promise<RequestResponse<T>>;
}

/**
 * Fetch instance
 */
export interface Fetcher<T, R = void> {
    /**
     *
     * @param request
     * @param options
     */
    fetch(request?: R, options?: RequestOptions<T>): RequestReturn<T>;
    /**
     * update fetcher options
     * @param options
     */
    config(options: FetcherOptions<T>);
    /**
     * clear cached responses
     */
    clearCache(): Promise<void>;
}

/**
 * Request context instance for request creator to consume
 */
export interface RequestContext {
    /**
     * AbortSignal that should be pass to native fetch() to support abort request
     */
    signal: AbortSignal;
}

/**
 * Request creator method that handles the actual network request/calls native fetch()
 * @param request the request params for each fetch instance
 * @param context request context object instance created by fetcher
 */
export type RequestCreator<T, R = void> = (request: R, context: RequestContext) => Promise<T>;