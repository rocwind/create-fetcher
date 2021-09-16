import { useEffect, useRef, useCallback, useState } from 'react';
import { AbortErrorName } from '../requests/utils';
import { Fetcher, RequestOptions, CacheMode } from '../types';
import { forEachResponse } from '../utils';
import { getURLFetcher } from './fetcher';
import { useDeepEqualMemo, useHookStateRef, useShallowEqualMemo, isEqualForKeys } from './utils';

export interface SWROptions extends Omit<RequestOptions, 'pollingWaitTime'> {
    /**
     * start the fetch request by manual call `refresh()` (don't auto start), default is false
     */
    manualStart?: boolean;
}
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
 * if there are new refresh request comes before previous request finished,
 * keep the one with higher priority (in case the request itself and related options
 * are the same)
 * @param cacheMode
 */
function getSWRCacheModePriority(cacheMode?: CacheMode) {
    switch (cacheMode) {
        case CacheMode.NoCache:
            return 4;
        case CacheMode.NoStore:
            return 3;
        case CacheMode.ForceLoad:
            return 2;
        case CacheMode.ForceCache:
            return 1;
        default:
            return 0;
    }
}
/**
 * Send request and return data in SWR way
 * @param url url to fetch
 * @request fetch() options
 * @options swr options
 */
export function useSWR<T>(url: string, request?: RequestInit, options?: SWROptions): SWRState<T>;
/**
 * Send request and return data in SWR way
 * @param fetcher fetcher used
 * @param request request params
 * @param options swr options
 */
export function useSWR<T, R = void>(
    fetcher: Fetcher<T, R>,
    request?: R,
    options?: SWROptions,
): SWRState<T>;

// implementation
export function useSWR<T, R = void>(
    fetcherOrURL: Fetcher<T, R> | string,
    request?: R,
    options?: SWROptions,
): SWRState<T> {
    const fetcher =
        typeof fetcherOrURL === 'string' ? getURLFetcher<T>(fetcherOrURL) : fetcherOrURL;

    const requestMemo = useDeepEqualMemo(request);
    const optionsMemo = useShallowEqualMemo(options);

    const [state, stateRef, updateState, cancelUpdate] = useHookStateRef<SWRState<T>>({
        isLoaded: false,
        isFreshOrValidated: false,
    } as SWRState<T>);

    const abortRef = useRef<() => void>();
    // keep track of last request & options for compare
    const lastRefreshCacheMode = useRef<CacheMode>();
    const lastRequestRef = useRef<R>();
    const lastOptionsRef = useRef<SWROptions>();

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

            // check if we need skip this refresh request
            if (abortRef.current) {
                // skip request if there is a ongoing request with the same request and
                // options that covers current refresh request
                if (
                    lastRequestRef.current === requestMemo &&
                    isEqualForKeys(lastOptionsRef.current, mergedOptions, [
                        'cache',
                        'cacheKey',
                        'cacheKeyPrefix',
                    ]) &&
                    getSWRCacheModePriority(lastOptionsRef.current?.cacheMode) >=
                        getSWRCacheModePriority(mergedOptions.cacheMode)
                ) {
                    return;
                }
            }

            // send fetch request
            lastRefreshCacheMode.current = cacheMode;
            lastRequestRef.current = requestMemo;
            lastOptionsRef.current = mergedOptions;
            const thisAbort = forEachResponse(
                fetcher.fetch(requestMemo, mergedOptions),
                ({ data, error, next }) => {
                    // isFreshOrValidated: no next request
                    const isFreshOrValidated = !next;
                    // current state
                    const currentData = data ?? stateRef.current.data;

                    // loaded: any data available or validated
                    const isLoaded = currentData !== undefined || isFreshOrValidated;

                    // do not handle abort error because
                    // it is triggered by client side abort() call or component unmount abort()
                    if (error?.name !== AbortErrorName) {
                        updateState({
                            data: data ?? stateRef.current.data,
                            error,
                            isLoaded,
                            isFreshOrValidated,
                        });
                    }

                    if (!next && abortRef.current === thisAbort) {
                        // clear abort if request fully settled
                        abortRef.current = undefined;
                    }
                },
            );

            // abort previous request
            abortRef.current?.();
            abortRef.current = thisAbort;
        },
        [fetcher, updateState, requestMemo, optionsMemo],
    );
    state.refresh = refresh;

    const abortedOnCleanupRef = useRef(false);
    useEffect(() => {
        // check if there is any pending refresh need to be resume
        if (abortedOnCleanupRef.current) {
            // resume previous pending refresh
            // it was aborted by the cleanup
            refresh(lastRefreshCacheMode.current);
            abortedOnCleanupRef.current = false;
        } else {
            // auto start
            const { manualStart } = optionsMemo ?? {};
            if (!manualStart) {
                refresh();
            }
        }

        return () => {
            // abort fetch if there is any pending request
            if (abortRef.current) {
                abortRef.current();
                abortRef.current = undefined;
                abortedOnCleanupRef.current = true;
            }
            // cancel previous pending state update
            cancelUpdate();
        };
    }, [refresh, cancelUpdate, optionsMemo]);

    return state;
}

export function createSWRHook<T, R = void>(fetcher: Fetcher<T, R>) {
    return function useSWRWrapper(request?: R, options?: SWROptions) {
        return useSWR(fetcher, request, options);
    };
}

export function useSWRHookCreator<T, R = void>(fetcher: Fetcher<T, R>) {
    const [result] = useState(() => createSWRHook(fetcher));
    return result;
}
