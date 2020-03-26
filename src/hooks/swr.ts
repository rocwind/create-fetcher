import { useState, useEffect, useRef } from 'react';
import { Fetcher, RequestOptions, RequestResponse } from '../types';

export type SWROptions<T> = Omit<RequestOptions<T>, 'pollingInterval'>;
interface SWRState<T> {
    data?: T;
    error?: Error;
    /**
     * is loading initial data
     */
    isLoading: boolean;
    /**
     * is validating data by network request
     */
    isValidating: boolean;
}
const defaultState: SWRState<any> = {
    isLoading: true,
    isValidating: true,
};

export function useSWR<T, R = void>(
    fetcher: Fetcher<T, R>,
    request?: R,
    options?: SWROptions<T>,
): SWRState<T> {
    // use ref to keep current state
    const stateRef = useRef<SWRState<T>>(defaultState);

    const rerender = useState(null)[1];

    useEffect(() => {
        // send request
        // - reset
        if (stateRef.current !== defaultState) {
            stateRef.current = defaultState;
            rerender({});
        }

        // - fetch and handle the update
        const { abort, response } = fetcher.fetch(request, options);
        const handleResponse = ({ data, error, next }: RequestResponse<T>) => {
            // validating: has next request
            const isValidating = !!next;
            // loading: no data available and validating
            const isLoading = !data && !stateRef.current.data && isValidating;
            if (next) {
                next.then(handleResponse);
            }

            stateRef.current = Object.assign({}, stateRef.current, {
                data: data ?? stateRef.current.data,
                error,
                isLoading,
                isValidating,
            });

            rerender({});
        };

        response.then(handleResponse);

        return () => {
            // abort fetch if there is any pending request
            if (stateRef.current.isValidating) {
                abort();
            }
        };
    }, [fetcher, request, options]);

    return stateRef.current;
}
