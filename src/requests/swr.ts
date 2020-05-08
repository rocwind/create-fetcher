import { RequestResponse, CacheMode, Logger } from '../types';
import { KeyPrefixHelper } from '../caches/utils';
import {
    FetcherRequest,
    createAbortError,
    RequestControl,
    createPromise,
    PromiseResolve,
    FetcherRequestOptions,
} from './utils';

/**
 * SWR request, handles request with cache
 */
export class SWRFetcherRequest<T, R> implements FetcherRequest<T> {
    private cacheControl: CacheControl<T>;
    private isRequestSent = false;
    private isAborted = false;
    private responseResolve: PromiseResolve<RequestResponse<T>>;

    constructor(
        private requestControl: RequestControl<T, R>,
        private cacheKey: string,
        private options: FetcherRequestOptions<T>,
        private request?: R,
        private logger?: Logger,
    ) {
        this.cacheControl = new CacheControl(options);
    }

    run(): Promise<RequestResponse<T>> {
        const responseControls = createPromise();
        this.responseResolve = responseControls.resolve;

        this.cacheControl.get(this.cacheKey).then((data) => {
            if (this.isAborted) {
                // might not necessary, just to ensure promise always resolved
                responseControls.resolve(createAbortError());
                return;
            }
            if (data !== undefined) {
                this.logger?.('valid cache found');
            }

            const response: RequestResponse<T> = {
                data,
            };

            // check if cache is fresh and send request if it's not
            if (this.cacheControl.isFresh(this.cacheKey)) {
                // resolve with response no matter it has cache loaded or not,
                // since there is no follow-up steps
                responseControls.resolve(response);
                return;
            }

            this.logger?.('start fetch from remote');

            let nextResolve: (res: RequestResponse<T>) => void;
            if (data !== undefined) {
                const nextControls = createPromise<RequestResponse<T>>();
                response.next = nextControls.promise;
                // resolve with cache
                responseControls.resolve(response);

                nextResolve = nextControls.resolve;
                // to let abort work on next promise
                this.responseResolve = nextResolve;
            } else {
                // no cache, reuse outter response
                nextResolve = responseControls.resolve;
            }

            this.requestControl
                .getResponse(this.cacheKey, this.request)
                .then((data) => {
                    this.isRequestSent = false;
                    this.cacheControl.set(this.cacheKey, data);
                    if (this.isAborted) {
                        // might not necessary, just to ensure promise always resolved
                        nextResolve(createAbortError());
                        return;
                    }

                    this.logger?.('fetch from remote success');
                    nextResolve({ data });
                })
                .catch((error) => {
                    this.isRequestSent = false;
                    this.logger?.('fetch from remote failed');
                    nextResolve({ error });
                });

            this.isRequestSent = true;
        });

        return responseControls.promise;
    }

    abort() {
        if (this.isAborted) {
            return;
        }
        this.isAborted = true;
        this.logger?.('aborted');

        this.responseResolve?.(createAbortError());
        if (this.isRequestSent) {
            this.requestControl.release(this.cacheKey);
        }
    }
}

/**
 * cache control helper, handles SWR cache options
 */
class CacheControl<T> {
    private prefixHelper: KeyPrefixHelper;
    private timestampByKey = new Map<string, number>();
    constructor(private options: FetcherRequestOptions<T>) {
        this.prefixHelper = new KeyPrefixHelper(options.cacheKeyPrefix ?? '');
    }

    isFresh(key: string): boolean {
        // treat cache as fresh for OnlyIfCached - no matter there is a cache or not
        // so it won't fetch from remote
        if (this.options.cacheMode === CacheMode.OnlyIfCached) {
            return true;
        }
        const timestamp = this.timestampByKey.get(key);
        if (!timestamp) {
            return false;
        }
        // cache is always fresh for force cache if there is any cache
        if (this.options.cacheMode === CacheMode.ForceCache) {
            return true;
        }
        return Date.now() - timestamp < this.options.cacheMinFresh * 1000;
    }

    get(key: string): Promise<T | undefined> {
        switch (this.options.cacheMode) {
            case CacheMode.NoStore:
            case CacheMode.NoCache:
                return Promise.resolve(undefined);
            default:
                break;
        }

        return this.options.cache.get(this.prefixHelper.appendPrefix(key)).then((cachedData) => {
            if (cachedData === undefined) {
                return undefined;
            }
            const { data, timestamp } = cachedData;
            if (!this.timestampByKey.has(key)) {
                this.timestampByKey.set(key, timestamp);
            }
            // check cache expires or not for default mode
            if (
                this.options.cacheMode === CacheMode.Default &&
                Date.now() - timestamp > this.options.cacheMaxAge * 1000
            ) {
                return undefined;
            }

            return data;
        });
    }

    set(key: string, value: T): Promise<void> {
        if (this.options.cacheMode === CacheMode.NoStore) {
            // skip cache for NoStore mode
            return Promise.resolve();
        }
        const timestamp = Date.now();
        this.timestampByKey.set(key, timestamp);
        return this.options.cache.set(this.prefixHelper.appendPrefix(key), {
            data: value,
            timestamp,
        });
    }
}
