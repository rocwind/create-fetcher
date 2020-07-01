import { useEffect, useRef, useCallback, useState } from 'react';
import { Fetcher, RequestOptions, CacheMode } from '../types';
import { forEachResponse } from '../utils';
import { useDeepEqualMemo, useRerender } from './utils';

export type SWROptions<T> = Omit<RequestOptions<T>, 'pollingWaitTime'> & {
    /**
     * start the fetch request by manual call `refresh()` (don't auto start), default is false
     */
    manualStart?: boolean;
};
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
    const optionsMemo = useDeepEqualMemo(options);

    // use ref to keep current state
    const stateRef = useRef<SWRState<T>>({
        isLoaded: false,
        isFreshOrValidated: false,
    } as SWRState<T>);

    const rerender = useRerender();

    const abortRef = useRef<() => void>();

    const refresh = useCallback(
        (cacheMode?: CacheMode) => {
            const mergedOptions = Object.assign({}, optionsMemo);
            if (cacheMode) {
                mergedOptions.cacheMode = cacheMode;
            }

            // reset state to not fully loaded
            stateRef.current = Object.assign({}, stateRef.current, {
                isFreshOrValidated: false,
                error: undefined,
                isLoaded: stateRef.current.data !== undefined,
            });
            rerender();

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

                    stateRef.current = Object.assign({}, stateRef.current, {
                        data: data ?? stateRef.current.data,
                        error,
                        isLoaded,
                        isFreshOrValidated,
                    } as SWRState<T>);

                    rerender();

                    if (!next) {
                        // clear abort if request fully settled
                        abortRef.current = undefined;
                    }
                },
            );
        },
        [rerender, fetcher, requestMemo, optionsMemo],
    );
    stateRef.current.refresh = refresh;

    useEffect(() => {
        // send request
        // - reset state if it's previous loaded
        if (stateRef.current.isLoaded || stateRef.current.error) {
            stateRef.current = Object.assign({}, stateRef.current, {
                data: undefined,
                error: undefined,
                isLoaded: false,
                isFreshOrValidated: false,
            });
            rerender();
        }

        // auto start
        const { manualStart } = optionsMemo ?? {};
        if (!manualStart) {
            refresh();
        }

        return () => {
            // abort fetch if there is any pending request
            abortRef.current?.();
        };
    }, [fetcher, refresh, optionsMemo]);

    return stateRef.current;
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
