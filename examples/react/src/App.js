import React from 'react';
import { createFetcher, CacheMode } from 'create-fetcher';
import {
    useSWR,
    usePolling,
    usePaginationListHookCreator,
    useSWRHookCreator,
} from 'create-fetcher/lib/hooks';
import { createLocalStorageCache } from 'create-fetcher/lib/caches/localStorage';
import { useReducer } from 'react';

const waitFor = (delayed) =>
    new Promise((resolve) => {
        setTimeout(resolve, delayed);
    });

// cache to local storage
const cache = createLocalStorageCache();

// resolves with current timestamp
const timestampFetcher = createFetcher(
    () => {
        console.log('timestamp request sending ...');
        return waitFor(500).then(() => {
            console.log('timestamp request end.');
            return Date.now();
        });
    },
    {
        cache,
        cacheKeyPrefix: 'timestamp:',
        cacheMode: CacheMode.Default,
        cacheMaxAge: 10,
        cacheMinFresh: 3,
        log: true,
    },
);

const echoFetcher = createFetcher(
    (request) => {
        return waitFor(1000).then(() => {
            return request;
        });
    },
    {
        cache,
        cacheKeyPrefix: 'echo:',
        cacheMode: CacheMode.NoStore,
        log: true,
    },
);

const listFetcher = createFetcher(
    (index) => {
        return waitFor(500).then(() => {
            return index;
        });
    },
    {
        cache,
        cacheKeyPrefix: 'list:',
        cacheMinFresh: 3,
        cacheMaxAge: 10,
        log: true,
    },
);

function App() {
    /**
     * basic swr use
     */
    const {
        data: swr,
        refresh,
        isFreshOrValidated,
    } = useSWR(timestampFetcher, null, {
        retryTimes: 3,
    });
    /**
     * only auto request when previous (swr) is ready and result is fresh
     */
    const { data: swr2 } = useSWRHookCreator(echoFetcher)(swr, {
        manualStart: !isFreshOrValidated,
    });
    /**
     * polling for data updates each 2 seconds
     */
    const {
        data: polling,
        isPolling,
        start,
        stop,
    } = usePolling(timestampFetcher, 2, null, {
        manualStart: true,
    });

    /**
     * pagination list hook by use its creator
     */
    const usePaginationListHook = usePaginationListHookCreator(
        listFetcher,
        (result) => [result],
        (result, prevRequest) => {
            if (prevRequest < 10) {
                return prevRequest + 1;
            }
            return null;
        },
    );
    const [paginationInitialRequest, togglePaginationInitialRequest] = useReducer((state) => {
        return state ? 0 : 1;
    }, 0);
    /**
     * use the pagination list hook
     */
    const {
        list,
        isLoading,
        isRefreshing,
        hasMore,
        loadMore,
        refresh: refreshList,
    } = usePaginationListHook(paginationInitialRequest);

    return (
        <table>
            <tbody>
                <DemoBoard
                    title={'useSWR()'}
                    data={swr}
                    buttons={[
                        {
                            title: 'refresh',
                            onClick: () => {
                                refresh(CacheMode.NoCache);
                            },
                        },
                    ]}
                />
                <DemoBoard title={'followed useSWR()'} data={swr2} />
                <DemoBoard
                    title={'usePolling()'}
                    data={JSON.stringify({ data: polling, isPolling })}
                    buttons={[
                        { title: 'start', onClick: () => start() },
                        { title: 'stop', onClick: () => stop() },
                    ]}
                />
                <DemoBoard
                    title={'usePaginationList()'}
                    data={JSON.stringify({ list, hasMore, isLoading, isRefreshing })}
                    buttons={[
                        { title: 'loadMore', onClick: () => loadMore() },
                        { title: 'refresh', onClick: () => refreshList() },
                        {
                            title: 'update initial request',
                            onClick: () => togglePaginationInitialRequest(),
                        },
                    ]}
                />
            </tbody>
        </table>
    );
}

function DemoBoard({ title, data, buttons }) {
    return (
        <tr>
            <td>{title}</td>
            <td>
                {buttons?.map((item, index) => {
                    return (
                        <button key={index} onClick={item.onClick}>
                            {item.title}
                        </button>
                    );
                })}
            </td>
            <td>{data ?? 'no data'}</td>
        </tr>
    );
}

export default App;
