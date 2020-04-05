import { useEffect, useCallback, useRef, useState } from 'react';
import { useDeepEqualMemo } from './utils';

interface Paging<K> {
    hasMore: boolean;
    isEmpty: boolean;
    isLoading: boolean;
    records: K[];
    nextPage: () => void;
    firstPage: () => void;
}

export type FilterType<R> = (records: R) => R;
export type FetcherType<K, T> = (args: T) => Promise<{ cursor: string; list: K[] }>;

const usePaging = <K, T>(
    fetcher: FetcherType<K, T>,
    options: T,
    recordsFilter?: FilterType<K[]>,
): Paging<K> => {
    const optionsMemo = useDeepEqualMemo(options);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [records, setRecords] = useState<K[]>([]);

    const isResetRef = useRef(false);

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

    const nextPage = useCallback(() => {
        const { hasMore: hasMoreRef, isLoading: isLoadingRef } = pagingStatusRef.current;
        if (!hasMoreRef || isLoadingRef) return;
        handleIsLoading(true);
        fetcher({ ...optionsMemo, ...questParamsRef.current })
            .then((res) => {
                const filterdList =
                    typeof recordsFilter === 'function' ? recordsFilter(res.list) : res.list;

                setRecords((list) => {
                    return !isResetRef.current ? list.concat(filterdList) : filterdList;
                });

                handleHasMore(Boolean(res.cursor) && res.cursor !== questParamsRef.current.cursor);

                if (res.cursor) {
                    questParamsRef.current.cursor = res.cursor;
                }
                isResetRef.current = false;
            })
            .finally(() => handleIsLoading(false));
    }, [fetcher, handleHasMore, handleIsLoading, optionsMemo, recordsFilter]);

    const firstPage = useCallback(() => {
        questParamsRef.current = { ...questParamsRef.current, cursor: '' };
        pagingStatusRef.current = { ...pagingStatusRef.current, hasMore: true };
        isResetRef.current = true;
        nextPage();
    }, [nextPage]);

    useEffect(() => {
        resetTimer.current = setTimeout(firstPage, 700);
        return (): void => {
            if (resetTimer.current) {
                clearTimeout(resetTimer.current);
            }
        };
    }, [firstPage]);

    return {
        isLoading,
        hasMore,
        isEmpty: !hasMore && records.length < 1,
        records,
        nextPage,
        firstPage,
    };
};
export default usePaging;
