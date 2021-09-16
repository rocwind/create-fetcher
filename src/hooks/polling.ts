import { useEffect, useRef, useCallback, useState } from 'react';
import { Fetcher, RequestOptions } from '../types';
import { forEachResponse } from '../utils';
import { getURLFetcher } from './fetcher';
import { useDeepEqualMemo, useRerender, useShallowEqualMemo } from './utils';

export interface PollingOptions extends Omit<RequestOptions, 'pollingWaitTime'> {
    /**
     * start the polling by manual call `start()` (don't auto start), default is false
     */
    manualStart?: boolean;
}

export interface PollingState<T> {
    data?: T;
    error?: Error;
    /**
     * polling is started or not
     */
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
 * Send polling requests
 * @param url url used for polling
 * @param pollingWaitTime wait time between polling requests in seconds
 * @param request fetch() options
 * @param options polling
 */
export function usePolling<T>(
    url: string,
    pollingWaitTime: number,
    request?: RequestInit,
    options?: PollingOptions,
): PollingState<T>;

/**
 * Send polling requests
 * @param fetcher fetcher used for polling requests
 * @param pollingWaitTime wait time between polling requests in seconds
 * @param request request params
 * @param options polling options
 */
export function usePolling<T, R = void>(
    fetcher: Fetcher<T, R>,
    pollingWaitTime: number,
    request?: R,
    options?: PollingOptions,
);

// implementation
export function usePolling<T, R = void>(
    fetcherOrURL: Fetcher<T, R> | string,
    pollingWaitTime: number,
    request?: R,
    options?: PollingOptions,
): PollingState<T> {
    const fetcher =
        typeof fetcherOrURL === 'string' ? getURLFetcher<T>(fetcherOrURL) : fetcherOrURL;
    const requestMemo = useDeepEqualMemo(request);
    const optionsMemo = useShallowEqualMemo(options);

    // use ref to keep current state
    const stateRef = useRef<PollingState<T>>({
        isPolling: false,
    } as PollingState<T>);

    const rerender = useRerender();

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
        rerender();
    }, []);
    stateRef.current.stop = stop;

    const start = useCallback(() => {
        if (stateRef.current.isPolling) {
            return;
        }

        abortRef.current = forEachResponse(
            fetcher.fetch(
                requestMemo,
                Object.assign({}, optionsMemo, {
                    pollingWaitTime,
                }),
            ),
            ({ data, error }) => {
                stateRef.current = {
                    ...stateRef.current,
                    data: data ?? stateRef.current.data,
                    error,
                };
                rerender();
            },
        );

        stateRef.current = {
            ...stateRef.current,
            error: undefined,
            isPolling: true,
        };
        rerender();
    }, [rerender, fetcher, pollingWaitTime, requestMemo, optionsMemo]);
    stateRef.current.start = start;

    useEffect(() => {
        // auto start
        const { manualStart } = optionsMemo ?? {};
        if (!manualStart) {
            start();
        }
        return () => {
            // make sure polling stop if any params updated
            stop();
        };
    }, [start, stop, optionsMemo]);

    return stateRef.current;
}

export function createPollingHook<T, R = void>(fetcher: Fetcher<T, R>, pollingWaitTime: number) {
    return function usePollingWrapper(request?: R, options?: PollingOptions) {
        return usePolling(fetcher, pollingWaitTime, request, options);
    };
}

export function usePollingHookCreator<T, R = void>(
    fetcher: Fetcher<T, R>,
    pollingWaitTime: number,
) {
    const [result] = useState(() => createPollingHook(fetcher, pollingWaitTime));
    return result;
}
