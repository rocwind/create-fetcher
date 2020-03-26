import hash from 'object-hash';
import { FetcherOptions, RequestOptions, RequestCreator } from '../types';
import { FetcherRequest, RequestControl } from './utils';
import { SWRFetcherRequest } from './swr';
import { ROEFetcherRequest } from './roe';
import { PollingFetcherRequest } from './polling';

export class RequestFactory<T, R> {
    private requestControl: RequestControl<T, R>;

    constructor(requestCreator: RequestCreator<T, R>) {
        this.requestControl = new RequestControlImpl(requestCreator);
    }

    getRequest(options: FetcherOptions<T> & RequestOptions<T>, request?: R): FetcherRequest<T> {
        const cacheKey = options?.cacheKey ?? hash(request ?? null);

        if (options.pollingInterval !== undefined) {
            return new PollingFetcherRequest(this.requestControl, cacheKey, options, request);
        }

        if (options.retryOnError) {
            return new ROEFetcherRequest(this.requestControl, cacheKey, options, request);
        }

        return new SWRFetcherRequest(this.requestControl, cacheKey, options, request);
    }
}

interface RequestInstance<T> {
    response: Promise<T>;
    refCount: number;
    abortController?: AbortController;
}
class RequestControlImpl<T, R> implements RequestControl<T, R> {
    private instanceByKey = new Map<string, RequestInstance<T>>();

    constructor(private requestCreator: RequestCreator<T, R>) {}

    getResponse(cacheKey: string, request?: R): Promise<T> {
        let instance = this.instanceByKey.get(cacheKey);
        if (!instance) {
            let abortController: AbortController;
            if (typeof AbortController !== 'undefined') {
                abortController = new AbortController();
            }
            const signal = abortController?.signal;

            instance = {
                response: this.requestCreator(request, { signal }),
                refCount: 0,
                abortController,
            };
            this.instanceByKey.set(cacheKey, instance);

            instance.response
                .catch(() => {
                    /* do nothing */
                })
                .then(() => {
                    this.instanceByKey.delete(cacheKey);
                });
        }

        instance.refCount += 1;
        return instance.response;
    }

    release(cacheKey): void {
        const instance = this.instanceByKey.get(cacheKey);
        if (!instance) {
            return;
        }
        instance.refCount -= 1;
        if (instance.refCount === 0) {
            this.instanceByKey.delete(cacheKey);
            if (instance.abortController) {
                instance.abortController.abort();
            }
        }
    }
}
