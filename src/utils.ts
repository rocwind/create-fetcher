import { RequestResponse } from './types';

export type ResponseHandler<T> = (response: RequestResponse<T>) => void;

export function forEachResponse<T>(handler: ResponseHandler<T>): ResponseHandler<T> {
    const forEachHandler: ResponseHandler<T> = response => {
        handler(response);
        response.next?.then(forEachHandler);
    };

    return forEachHandler;
}
