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
