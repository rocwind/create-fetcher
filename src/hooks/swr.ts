import { useEffect, useRef, useCallback, useState } from 'react';
import { Fetcher, RequestOptions, CacheMode } from '../types';
import { forEachResponse } from '../utils';
import { useDeepEqualMemo, useHookStateRef, useShallowEqualMemo } from './utils';

export type SWROptions<T> = Omit<RequestOptions<T>, 'pollingWaitTime'> & {
    /**
     * start the fetch request by manual call `refresh()` (don't auto start), default is false
     */
    manualStart?: boolean;
};
export interface SWRState<T> {
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
    /**
     * refresh data by trigger another swr request process
     * @param cacheMode optional override cacheMode for this refresh fetch
     */
    refresh: (cacheMode?: CacheMode) => void;
}

/**
 * Send request and return data in SWR way
 * @param fetcher fetcher used
 * @param request request params
 * @param options
 */
export function useSWR<T, R = void>(
    fetcher: Fetcher<T, R>,
    request?: R,
    options?: SWROptions<T>,
): SWRState<T> {
    const requestMemo = useDeepEqualMemo(request);
    const optionsMemo = useShallowEqualMemo(options);

    const [state, stateRef, updateState, cancelUpdate] = useHookStateRef<SWRState<T>>({
        isLoaded: false,
        isFreshOrValidated: false,
    } as SWRState<T>);

    const abortRef = useRef<() => void>();

    const refresh = useCallback(
        (cacheMode?: CacheMode) => {
            const mergedOptions = Object.assign({}, optionsMemo);
            if (cacheMode) {
                mergedOptions.cacheMode = cacheMode;
            }

            // reset state to not fully loaded
            updateState({
                isFreshOrValidated: false,
                error: undefined,
                isLoaded: stateRef.current.data !== undefined,
            });

            // abort previous request if there is any
            abortRef.current?.();

            // send fetch request
            abortRef.current = forEachResponse(
                fetcher.fetch(requestMemo, mergedOptions),
                ({ data, error, next }) => {
                    // isFreshOrValidated: no next request
                    const isFreshOrValidated = !next;
                    // current state
                    const currentData = data ?? stateRef.current.data;

                    // loaded: any data available or validated
                    const isLoaded = currentData !== undefined || isFreshOrValidated;

                    updateState({
                        data: data ?? stateRef.current.data,
                        error,
                        isLoaded,
                        isFreshOrValidated,
                    });

                    if (!next) {
                        // clear abort if request fully settled
                        abortRef.current = undefined;
                    }
                },
            );
        },
        [fetcher, updateState, requestMemo, optionsMemo],
    );
    state.refresh = refresh;

    useEffect(() => {
        // auto start
        const { manualStart } = optionsMemo ?? {};
        if (!manualStart) {
            refresh();
        }

        return () => {
            // abort fetch if there is any pending request
            abortRef.current?.();
            // cancel previous pending state update
            cancelUpdate();
        };
    }, [refresh, cancelUpdate, optionsMemo]);

    return state;
}

export function createSWRHook<T, R = void>(fetcher: Fetcher<T, R>) {
    return function useSWRWrapper(request?: R, options?: SWROptions<T>) {
        return useSWR(fetcher, request, options);
    };
}

export function useSWRHookCreator<T, R = void>(fetcher: Fetcher<T, R>) {
    const [result] = useState(() => createSWRHook(fetcher));
    return result;
}
