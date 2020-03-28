import {
    Fetcher,
    RequestCreator,
    FetcherOptions,
    CacheMode,
    RequestOptions,
    Cache,
    BackoffMode,
    Logger,
} from './types';
import { createMemoryCache } from './caches/memory';
import { KeyPrefixHelper } from './caches/utils';
import { RequestFactory } from './requests/factory';

const defaultFetcherOptions: FetcherOptions<any> = {
    cache: createMemoryCache(),
    cacheMode: CacheMode.Default,
    cacheMaxAge: 3600,
    cacheMinFresh: 1,
};

const defaultRequestOptions: RequestOptions<any> = {
    retryTimes: 3,
    retryBackoff: BackoffMode.JitteredExponential,
    retryInitialWaitTime: 1,
};

export class FetcherImpl<T, R = void> implements Fetcher<T, R> {
    private options = Object.assign({}, defaultFetcherOptions);
    private requestFactory: RequestFactory<T, R>;
    constructor(requestCreator: RequestCreator<T, R>, options: FetcherOptions<T>) {
        this.config(options);
        this.requestFactory = new RequestFactory(requestCreator, getLogger(options));
    }

    config(options) {
        Object.assign(this.options, options);
    }

    clearCache(cache?: Cache<any>) {
        const cacheToClear = cache ?? this.options.cache;
        const prefixHelper = new KeyPrefixHelper(this.options.cacheKeyPrefix);
        return cacheToClear
            .getKeys()
            .then(keys =>
                Promise.all(
                    keys
                        .filter(key => prefixHelper.matchPrefix(key))
                        .map(key => cacheToClear.remove(key)),
                ),
            ) as Promise<void>;
    }

    fetch(request?: R, options?: RequestOptions<T>) {
        const mergedOptions = Object.assign({}, defaultRequestOptions, this.options, options);

        const fetcherRequest = this.requestFactory.getRequest(mergedOptions, request);

        return {
            abort: () => {
                fetcherRequest.abort();
            },
            response: fetcherRequest.run(),
        };
    }
}

function getLogger(options: FetcherOptions<any>): Logger {
    if (!options.logger) {
        return undefined;
    }

    if (typeof options.logger === 'function') {
        return options.logger;
    }

    return console.log;
}
