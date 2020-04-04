import { useState, useEffect, useRef } from 'react';
import { Fetcher, RequestOptions } from '../types';
import { forEachResponse } from '../utils';
import { useDeepEqualMemo } from './utils';

export type SWROptions<T> = Omit<RequestOptions<T>, 'pollingWaitTime'>;
interface SWRState<T> {
    data?: T;
    error?: Error;
    /**
     * is initial data loaded, it may come from cache
     */
    isLoaded: boolean;
    /**
     * is data fresh or validated by sending request
     */
    isFreshOrValidated: boolean;
}
const defaultState: SWRState<any> = {
    isLoaded: false,
    isFreshOrValidated: false,
};

/**
 *
 * @param fetcher
 * @param request need useMemo
 * @param options need useMemo
 */
export function useSWR<T, R = void>(
    fetcher: Fetcher<T, R>,
    request?: R,
    options?: SWROptions<T>,
): SWRState<T> {
    const requestMemo = useDeepEqualMemo(request);
    const optionsMemo = useDeepEqualMemo(options);

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
        const { abort, response } = fetcher.fetch(requestMemo, optionsMemo);
        response.then(
            forEachResponse(({ data, error, next }) => {
                // isFreshOrValidated: no next request
                const isFreshOrValidated = !next;
                // current state
                const currentData = data ?? stateRef.current.data;
                // loaded: any data available or validated
                const isLoaded = currentData !== undefined || isFreshOrValidated;

                stateRef.current = Object.assign({}, stateRef.current, {
                    data: data ?? stateRef.current.data,
                    error,
                    isLoaded,
                    isFreshOrValidated,
                } as SWRState<T>);

                rerender({});
            }),
        );

        return () => {
            // abort fetch if there is any pending request
            if (!stateRef.current.isFreshOrValidated) {
                abort();
            }
        };
    }, [fetcher, requestMemo, optionsMemo, rerender]);

    return stateRef.current;
}
