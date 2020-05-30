import { useEffect, useRef, useCallback, useState } from 'react';
import { Fetcher, RequestOptions, CacheMode } from '../types';
import { forEachResponse } from '../utils';
import { useDeepEqualMemo, useRerender, isDeepEqual } from './utils';

export type PaginationListOptions<T> = Omit<RequestOptions<T>, 'pollingWaitTime'> & {
    /**
     * start the request by manual call `refresh()` or `loadMore()`, default is false
     */
    manualStart?: boolean;
};

interface PaginationListState<L, T> {
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
     *
     */
    isLoading: boolean;
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
    options?: PaginationListOptions<T>,
): PaginationListState<L, T> {
    const initialRequestMemo = useDeepEqualMemo(initialRequest);
    const optionsMemo = useDeepEqualMemo(options);

    // use ref to keep current state
    const stateRef = useRef<PaginationListState<L, T>>({
        list: [],
        isLoading: false,
        hasMore: true,
    } as PaginationListState<L, T>);

    const rerender = useRerender();

    const nextRequestRef = useRef<R>();
    const abortRef = useRef<() => void>();

    const resetState = useCallback(() => {
        if (
            stateRef.current.list.length > 0 ||
            stateRef.current.error ||
            stateRef.current.isLoading ||
            !stateRef.current.hasMore
        ) {
            stateRef.current = Object.assign({}, stateRef.current, {
                data: undefined,
                list: [],
                error: undefined,
                isLoading: false,
                hasMore: true,
            });
            rerender();
        }
    }, [rerender]);

    const load = useCallback(
        (isRefresh: boolean) => {
            // abort previous load
            abortRef.current?.();

            // reset state and request on refresh
            if (isRefresh) {
                resetState();
                nextRequestRef.current = initialRequestMemo;
            }

            // skip if loadMore on nothing more
            if (!isRefresh && !stateRef.current.hasMore) {
                return;
            }

            // mark loading state
            if (!stateRef.current.isLoading) {
                stateRef.current = Object.assign({}, stateRef.current, {
                    isLoading: true,
                });
                rerender();
            }

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

            const { abort, response } = fetcher.fetch(nextRequestRef.current, mergedOptions);
            abortRef.current = abort;

            response.then(
                forEachResponse(({ data, error, next }) => {
                    if (data !== undefined) {
                        const pageList = listExtractor(data);
                        const prevList = stateRef.current.list;
                        const list = isInitialPage ? pageList : prevList.concat(pageList);
                        // compare if changed before we update the list
                        if (list.length !== prevList.length || !isDeepEqual(list, prevList)) {
                            stateRef.current = Object.assign({}, stateRef.current, {
                                list,
                            });
                        }

                        stateRef.current = Object.assign({}, stateRef.current, {
                            data,
                        });
                    }

                    if (!next) {
                        // no longer loading
                        stateRef.current = Object.assign({}, stateRef.current, {
                            isLoading: false,
                        });

                        // populate nextRequest on success request
                        if (!error) {
                            nextRequestRef.current = nextRequestCreator(
                                data,
                                nextRequestRef.current,
                            );

                            // it still has more if there is nextRequest
                            stateRef.current = Object.assign({}, stateRef.current, {
                                hasMore: nextRequestRef.current != null,
                            });
                        }
                    }

                    // update with latest error
                    stateRef.current = Object.assign({}, stateRef.current, {
                        error,
                    });

                    rerender();
                }),
            );
        },
        [resetState, listExtractor, nextRequestCreator, initialRequestMemo, optionsMemo],
    );

    const loadMore = useCallback(() => {
        load(false);
    }, [load]);
    stateRef.current.loadMore = loadMore;
    const refresh = useCallback(() => {
        load(true);
    }, [load]);
    stateRef.current.refresh = refresh;

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
        };
    }, [loadMore, initialRequestMemo, optionsMemo]);
    return stateRef.current;
}

export function createPaginationListHook<L, T, R>(
    fetcher: Fetcher<T, R>,
    listExtractor: ListExtractor<T, L>,
    nextRequestCreator: NextRequestCreator<T, R>,
) {
    return function usePaginationListWrapper(
        initialRequest?: R,
        options?: PaginationListOptions<T>,
    ) {
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
