import { RequestResponse } from '../types';

export interface FetcherRequest<T, R> {
    run(): Promise<RequestResponse<T>>;
    abort(): void;
}

export function createAbortError(): RequestResponse<any> {
    const error = new Error('Aborted');
    error.name = 'AbortError';
    return { error };
}
