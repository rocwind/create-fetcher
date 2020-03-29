import { useState, useEffect, useRef, useCallback } from 'react';
import { Fetcher, RequestOptions } from '../types';
import { forEachResponse } from '../utils';
import { useDeepEqualMemo } from './utils';

export type PollingOptions<T> = Omit<RequestOptions<T>, 'pollingWaitTime'> & {
    /**
     * start the polling by manual call start() (don't auto start), default is false
     */
    manualStart?: boolean;
};

interface PollingState<T> {
    data?: T;
    error?: Error;
    isPolling: boolean;
    /**
     * start polling
     */
    start: () => void;
    /**
     * stop polling
     */
    stop: () => void;
}

/**
 *
 * @param fetcher
 * @param pollingWaitTime
 * @param request need useMemo
 * @param options need useMemo
 */
export function usePolling<T, R = void>(
    fetcher: Fetcher<T, R>,
    pollingWaitTime: number,
    request?: R,
    options?: PollingOptions<T>,
): PollingState<T> {
    const requestMemo = useDeepEqualMemo(request);
    const optionsMemo = useDeepEqualMemo(options);

    // use ref to keep current state
    const stateRef = useRef<PollingState<T>>({
        isPolling: false,
    } as PollingState<T>);

    const rerender = useState(null)[1];

    const abortRef = useRef<() => void>();

    // stop polling control
    const stop = useCallback(() => {
        if (!stateRef.current.isPolling) {
            return;
        }
        abortRef.current?.();

        stateRef.current = {
            ...stateRef.current,
            isPolling: false,
        };
        rerender({});
    }, []);
    stateRef.current.stop = stop;

    const start = useCallback(() => {
        if (stateRef.current.isPolling) {
            return;
        }

        const { abort, response } = fetcher.fetch(
            requestMemo,
            Object.assign({}, optionsMemo, {
                pollingWaitTime,
            }),
        );
        response.then(
            forEachResponse(({ data, error }) => {
                stateRef.current = {
                    ...stateRef.current,
                    data: data ?? stateRef.current.data,
                    error,
                };
                rerender({});
            }),
        );
        abortRef.current = abort;

        stateRef.current = {
            ...stateRef.current,
            error: undefined,
            isPolling: true,
        };
        rerender({});
    }, [rerender, fetcher, pollingWaitTime, requestMemo, optionsMemo]);
    stateRef.current.start = start;

    // auto start
    const { manualStart } = optionsMemo ?? {};
    useEffect(() => {
        if (!manualStart) {
            start();
        }
        return () => {
            // make sure polling stop if any params updated
            stop();
        };
    }, [start, stop]);

    return stateRef.current;
}
