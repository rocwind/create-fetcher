import { useEffect, useRef, useCallback, useState } from 'react';
import { AbortErrorName } from '../requests/utils';
import { Fetcher, RequestOptions, CacheMode } from '../types';
import { forEachResponse } from '../utils';
import { useDeepEqualMemo, useHookStateRef, isDeepEqual, useShallowEqualMemo } from './utils';

export interface PaginationListOptions extends Omit<RequestOptions, 'pollingWaitTime'> {
    /**
     * start the request by manual call `refresh()` or `loadMore()`, default is false
     */
    manualStart?: boolean;
}

export interface PaginationListState<L, T> {
    /**
     * the concat list
     */
    list: L[];
    /**
     * latest response data
     */
    data?: T;
    /**
     * latest error
     */
    error?: Error;
    /**
     * is loading data - true for both refreshing and loading more
     */
    isLoading: boolean;
    /**
     * is refreshing data - true for refreshing
     */
    isRefreshing: boolean;
    /**
     * there is still more list items to load or not
     */
    hasMore: boolean;
    /**
     *
     */
    loadMore: () => void;

    /**
     * refresh list data
     */
    refresh: () => void;
}

/**
 * extract list from received data
 */
export type ListExtractor<T, L> = (data: T) => L[];
/**
 * create next request by previous request and data, return null if it reaches end
 */
export type NextRequestCreator<T, R> = (prevData: T, prevRequest?: R) => R;

/**
 *
 * @param fetcher
 * @param listExtractor
 * @param nextRequestCreator
 * @param initialRequest
 * @param options
 */
export function usePaginationList<L, T, R>(
    fetcher: Fetcher<T, R>,
    listExtractor: ListExtractor<T, L>,
    nextRequestCreator: NextRequestCreator<T, R>,
    initialRequest?: R,
    options?: PaginationListOptions,
): PaginationListState<L, T> {
    const initialRequestMemo = useDeepEqualMemo(initialRequest);
    const optionsMemo = useShallowEqualMemo(options);

    const [state, stateRef, updateState, cancelUpdate] = useHookStateRef<PaginationListState<L, T>>(
        {
            list: [],
            isLoading: false,
            isRefreshing: false,
            hasMore: true,
        } as PaginationListState<L, T>,
    );

    const nextRequestRef = useRef<R>();
    const abortRef = useRef<() => void>();

    const resetState = useCallback(() => {
        if (
            stateRef.current.list.length > 0 ||
            stateRef.current.error ||
            stateRef.current.isLoading ||
            !stateRef.current.hasMore
        ) {
            updateState({
                data: undefined,
                list: [],
                error: undefined,
                isLoading: false,
                isRefreshing: false,
                hasMore: true,
            });
        }
    }, [updateState]);

    const load = useCallback(
        (isRefresh: boolean) => {
            if (
                !isRefresh &&
                // loading is in progress, skip
                (abortRef.current ||
                    // skip if loadMore on nothing more
                    nextRequestRef.current === null)
            ) {
                return;
            }
            // abort previous load
            abortRef.current?.();

            // reset state and request on refresh
            if (isRefresh) {
                resetState();
                updateState({
                    isRefreshing: true,
                });
                nextRequestRef.current = initialRequestMemo;
            }

            // mark loading state
            updateState({
                isLoading: true,
            });

            // is first page if requesting request is the initial request
            const isInitialPage = nextRequestRef.current === initialRequestMemo;

            // only first request follows the cacheMode setting,
            // the rest requests would be CacheMode.NoStore
            const mergedOptions = Object.assign({}, optionsMemo);
            if (!isInitialPage) {
                Object.assign(mergedOptions, {
                    cacheMode: CacheMode.NoStore,
                });
            }

            const thisAbort = forEachResponse(
                fetcher.fetch(nextRequestRef.current, mergedOptions),
                ({ data, error, next }) => {
                    if (data !== undefined) {
                        const pageList = listExtractor(data);
                        const prevList = stateRef.current.list;
                        const list = isInitialPage ? pageList : prevList.concat(pageList);
                        // compare if it changed before we update the list
                        if (list.length !== prevList.length || !isDeepEqual(list, prevList)) {
                            updateState({
                                list,
                            });
                        }

                        updateState({
                            data,
                        });
                    }

                    if (!next) {
                        // no longer loading
                        updateState({
                            isLoading: false,
                            isRefreshing: false,
                        });

                        // populate nextRequest on success request
                        if (!error) {
                            nextRequestRef.current = nextRequestCreator(
                                data,
                                nextRequestRef.current,
                            );

                            // it still has more if there is nextRequest
                            updateState({
                                hasMore: nextRequestRef.current != null,
                            });
                        }

                        if (abortRef.current === thisAbort) {
                            abortRef.current = undefined;
                        }
                    }

                    // update with latest error
                    // but do not handle abort error because
                    // it is triggered by client side abort() call or component unmount abort()
                    if (error?.name !== AbortErrorName) {
                        updateState({
                            error,
                        });
                    }
                },
            );
            abortRef.current = thisAbort;
        },
        [resetState, listExtractor, nextRequestCreator, initialRequestMemo, optionsMemo],
    );

    const loadMore = useCallback(() => {
        load(false);
    }, [load]);
    state.loadMore = loadMore;
    const refresh = useCallback(() => {
        load(true);
    }, [load]);
    state.refresh = refresh;

    useEffect(() => {
        nextRequestRef.current = initialRequestMemo;
        resetState();
        // auto start by loadMore
        const { manualStart } = optionsMemo ?? {};
        if (!manualStart) {
            loadMore();
        }

        return () => {
            abortRef.current?.();
            abortRef.current = undefined;

            cancelUpdate();
        };
    }, [loadMore, cancelUpdate, initialRequestMemo, optionsMemo]);
    return state;
}

export function createPaginationListHook<L, T, R>(
    fetcher: Fetcher<T, R>,
    listExtractor: ListExtractor<T, L>,
    nextRequestCreator: NextRequestCreator<T, R>,
) {
    return function usePaginationListWrapper(initialRequest?: R, options?: PaginationListOptions) {
        return usePaginationList(
            fetcher,
            listExtractor,
            nextRequestCreator,
            initialRequest,
            options,
        );
    };
}

export function usePaginationListHookCreator<L, T, R>(
    fetcher: Fetcher<T, R>,
    listExtractor: ListExtractor<T, L>,
    nextRequestCreator: NextRequestCreator<T, R>,
) {
    const [result] = useState(() => {
        return createPaginationListHook(fetcher, listExtractor, nextRequestCreator);
    });
    return result;
}
