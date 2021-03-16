import hash from 'object-hash';
import { RequestCreator, RequestOptions } from '../types';
import { FetcherRequest, RequestControl, getFetcherRequestLogger } from './utils';
import { SWRFetcherRequest } from './swr';
import { ROEFetcherRequest } from './roe';
import { PollingFetcherRequest } from './polling';

export class RequestFactory<T, R> {
    private requestControl: RequestControl<T, R>;

    constructor(requestCreator: RequestCreator<T, R>) {
        this.requestControl = new RequestControlImpl(requestCreator);
    }

    getRequest(options: RequestOptions, request?: R): FetcherRequest<T> {
        const cacheKey =
            options?.cacheKey ?? hash(request ?? null, { algorithm: 'md5', respectType: false });

        if (typeof options.pollingWaitTime === 'number') {
            return new PollingFetcherRequest(
                this.requestControl,
                cacheKey,
                options,
                request,
                getFetcherRequestLogger('polling', options, cacheKey, request),
            );
        }

        if (options.retryTimes > 0) {
            return new ROEFetcherRequest(
                this.requestControl,
                cacheKey,
                options,
                request,
                getFetcherRequestLogger('swr', options, cacheKey, request),
            );
        }

        return new SWRFetcherRequest(
            this.requestControl,
            cacheKey,
            options,
            request,
            getFetcherRequestLogger('swr', options, cacheKey, request),
        );
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
            instance.abortController?.abort();
        }
    }
}
