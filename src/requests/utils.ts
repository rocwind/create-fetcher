import { RequestResponse } from '../types';

export interface FetcherRequest<T> {
    run(): Promise<RequestResponse<T>>;
    abort(): void;
}

export interface RequestControl<T, R> {
    getResponse(cacheKey: string, request?: R): Promise<T>;
    release(cacheKey): void;
}

export function createAbortError(): RequestResponse<any> {
    const error = new Error('Aborted');
    error.name = 'AbortError';
    return { error };
}

export interface PromiseWithControls<T> {
    promise: Promise<T>;
    resolve: (data?: T) => void;
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
