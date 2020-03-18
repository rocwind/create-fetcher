import { Fetcher, RequestCreator, FetcherOptions, CacheMode } from './types';
import createMemoryCache from './caches/memory';

const defaultOptions: FetcherOptions<any> = {
    cache: createMemoryCache(),
    cacheMode: CacheMode.Default,
    cacheMaxAge: 3600,
    cacheMinFresh: 1,
};

export class FetcherImpl<T, R = void> implements Fetcher<T, R> {
    private options = Object.assign({}, defaultOptions);
    constructor(private requestCreator: RequestCreator<T, R>, options: FetcherOptions<T>) {
        this.config(options);
    }

    fetch() {
        return {
            abort: () => {},
            response: Promise.resolve({}),
        };
    }

    config(options) {
        Object.assign(this.options, options);
    }
}
