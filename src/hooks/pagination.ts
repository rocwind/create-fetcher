import { useEffect, useCallback, useRef, useState } from 'react';
import { useDeepEqualMemo } from './utils';

type PagingState<K> = {
    hasMore: boolean;
    isEmpty: boolean;
    isLoading: boolean;
    records: K[];
    fetchRecords: () => void;
    resetFetchRecords: () => void;
};

export type FilterType<R> = (list: R) => R;
export type FetcherType<K, T> = (args: T) => Promise<{ cursor: string; list: K[] }>;

const usePagination = <K, T>(
    fetcher: FetcherType<K, T>,
    options: T,
    recordFilter?: FilterType<K[]>,
): PagingState<K> => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [records, setRecords] = useState<K[]>([]);

    const optionsMemo = useDeepEqualMemo(options);

    const isRefreshRef = useRef(false);

    const resetTimer = useRef<ReturnType<typeof setTimeout>>();

    const questParamsRef = useRef({
        cursor: '',
        size: 10,
    });
    const pagingStatusRef = useRef({
        isLoading,
        hasMore,
    });

    const handleIsLoading = useCallback((v: boolean) => {
        setIsLoading(v);
        pagingStatusRef.current.isLoading = v;
    }, []);

    const handleHasMore = useCallback((v: boolean) => {
        setHasMore(v);
        pagingStatusRef.current.hasMore = v;
    }, []);

    const fetchRecords = useCallback(() => {
        const { hasMore: hasMoreRef, isLoading: isLoadingRef } = pagingStatusRef.current;
        if (!hasMoreRef || isLoadingRef) return;
        handleIsLoading(true);
        fetcher({ ...optionsMemo, ...questParamsRef.current })
            .then((res) => {
                const filterdList =
                    typeof recordFilter === 'function' ? recordFilter(res.list) : res.list;

                setRecords((list) => {
                    return !isRefreshRef.current ? list.concat(filterdList) : filterdList;
                });

                handleHasMore(Boolean(res.cursor) && res.cursor !== questParamsRef.current.cursor);

                if (res.cursor) {
                    questParamsRef.current.cursor = res.cursor;
                }
                isRefreshRef.current = false;
            })
            .finally(() => handleIsLoading(false));
    }, [fetcher, handleHasMore, handleIsLoading, optionsMemo, recordFilter]);

    const resetFetchRecords = useCallback(() => {
        questParamsRef.current = { ...questParamsRef.current, cursor: '' };
        pagingStatusRef.current = { ...pagingStatusRef.current, hasMore: true };
        isRefreshRef.current = true;
        fetchRecords();
    }, [fetchRecords]);

    useEffect(() => {
        resetTimer.current = setTimeout(resetFetchRecords, 700);
        return (): void => {
            if (resetTimer.current) {
                clearTimeout(resetTimer.current);
            }
        };
    }, [resetFetchRecords]);

    return {
        isLoading,
        hasMore,
        isEmpty: !hasMore && records.length < 1,
        records,
        fetchRecords,
        resetFetchRecords,
    };
};
export default usePagination;
