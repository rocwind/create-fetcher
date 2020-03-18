/**
 * Cache
 */
export interface Cache<T> {
    /**
     * get cached data
     * @param key
     */
    get(key: string): Promise<T | null | undefined>;
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
     * use local cache if it exists, , otherwise load from network and store result to cache
     */
    ForceCache = 4,
    /**
     * use local cache result, throw errors on cache miss
     */
    OnlyIfCached = 5,
}

/**
 * Options for fetcher
 */
export interface FetcherOptions<T> {
    /**
     * cache
     */
    cache: Cache<T>;
    /**
     * default cache mode
     */
    cacheMode: CacheMode;
    /**
     * key prefix
     */
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
     *
     */
    pollingInterval?: number;
    /**
     *
     */
    shouldRetryOnError?: boolean;
};

/**
 * Response data structure for a fetch request
 */
export interface FetcherResponse<T> {
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
export interface RequestReturn<T> {
    abort: () => void;
    response: Promise<FetcherResponse<T>>;
}

/**
 *
 */
export interface Fetcher<T, R = void> {
    fetch(request?: R, options?: RequestOptions<T>): RequestReturn<T>;
    config(options: FetcherOptions<T>);
}

/**
 *
 */
export type RequestCreator<T, R = void> = (request?: R) => Promise<T>;
