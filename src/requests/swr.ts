import { RequestResponse, CacheMode, FetcherOptions } from '../types';
import { KeyPrefixHelper } from '../caches/utils';
import {
    FetcherRequest,
    createAbortError,
    RequestControl,
    PromiseWithControls,
    createPromise,
} from './utils';

/**
 * SWR request, handles request with cache
 */
export class SWRFetcherRequest<T, R> implements FetcherRequest<T> {
    private cacheControl: CacheControl<T>;
    private isRequestSent = false;
    private isAborted = false;
    private response: PromiseWithControls<RequestResponse<T>>;

    constructor(
        private requestControl: RequestControl<T, R>,
        private cacheKey: string,
        private options: FetcherOptions<T>,
        private request?: R,
    ) {
        this.cacheControl = new CacheControl(options);
    }

    run(): Promise<RequestResponse<T>> {
        // return ongoing response
        if (this.response) {
            return this.response.promise;
        }

        this.response = createPromise();

        this.cacheControl.get(this.cacheKey).then(data => {
            if (this.isAborted) {
                // might not necessary, just to ensure promise always resolved
                this.response.resolve(createAbortError());
                return;
            }

            const response: RequestResponse<T> = {
                data,
            };

            switch (this.options.cacheMode) {
                case CacheMode.OnlyIfCached:
                    // skip load from network for OnlyIfCached
                    this.response.resolve(response);
                    break;
                case CacheMode.Default:
                case CacheMode.NoStore:
                case CacheMode.NoCache:
                case CacheMode.ForceCache:
                default:
                    // check if cache is fresh and send request if it's not
                    if (this.cacheControl.isFresh(this.cacheKey)) {
                        this.response.resolve(response);
                        break;
                    }

                    const next = createPromise<RequestResponse<T>>();
                    response.next = next.promise;
                    this.response.resolve(response);

                    this.requestControl
                        .getResponse(this.cacheKey, this.request)
                        .then(data => {
                            this.cacheControl.set(this.cacheKey, data);
                            if (this.isAborted) {
                                // might not necessary, just to ensure promise always resolved
                                next.resolve(createAbortError());
                                return;
                            }

                            next.resolve({ data });
                        })
                        .catch(error => {
                            next.resolve({ error });
                        });

                    this.response.resolve = next.resolve;
                    this.isRequestSent = true;
                    break;
            }
        });

        return this.response.promise;
    }

    abort() {
        if (this.isAborted) {
            return;
        }
        this.isAborted = true;
        if (this.response) {
            this.response.resolve(createAbortError());
        }

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
    constructor(private options: FetcherOptions<T>) {
        this.prefixHelper = new KeyPrefixHelper(options.cacheKeyPrefix ?? '');
    }

    isFresh(key: string): boolean {
        const timestamp = this.timestampByKey.get(key);
        if (!timestamp) {
            return false;
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

        return this.options.cache.get(this.prefixHelper.appendPrefix(key)).then(cachedData => {
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
