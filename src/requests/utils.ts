import { RequestResponse } from '../types';

export interface FetcherRequest<T> {
    run(): Promise<RequestResponse<T>>;
    abort(): void;
}

export interface RequestControl<T, R> {
    getResponse(cacheKey: string, request?: R): Promise<T>;
    release(cacheKey): void;
}

export const AbortErrorName = 'AbortError';

export function createAbortError(): RequestResponse<any> {
    const error = new Error('Aborted');
    error.name = AbortErrorName;
    return { error };
}

export type PromiseResolve<T> = (data?: T) => void;
export interface PromiseWithControls<T> {
    promise: Promise<T>;
    resolve: PromiseResolve<T>;
    reject: (err?: Error) => void;
}

export function createPromise<T>(): PromiseWithControls<T> {
    let resolve;
    let reject;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {
        promise,
        resolve,
        reject,
    };
}

export function proxyResponseWithAdditionalNext<T>(
    response: RequestResponse<T>,
    onEnd: (res: RequestResponse<T>) => Promise<RequestResponse<T>> | undefined,
): RequestResponse<T> {
    const { next } = response;
    let proxiedNext: Promise<RequestResponse<T>>;
    if (!next) {
        // reach end
        proxiedNext = onEnd(response);
    } else {
        // continues the proxy to next
        const promiseControls = createPromise<RequestResponse<T>>();
        proxiedNext = promiseControls.promise;
        next.then(res => {
            promiseControls.resolve(proxyResponseWithAdditionalNext(res, onEnd));
        });
    }

    return {
        ...response,
        next: proxiedNext,
    };
}
