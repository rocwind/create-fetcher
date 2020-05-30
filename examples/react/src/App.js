import React from 'react';
import { createFetcher, CacheMode } from 'create-fetcher';
import {
    useSWR,
    usePolling,
    usePaginationListHookCreator,
    useSWRHookCreator,
} from 'create-fetcher/lib/hooks';
import { createLocalStorageCache } from 'create-fetcher/lib/caches/localStorage';

const waitFor = (delayed) =>
    new Promise((resolve) => {
        setTimeout(resolve, delayed);
    });

// cache to local storage
const cache = createLocalStorageCache('@fetcher');

// resolves with current timestamp
const timestampFetcher = createFetcher(
    () => {
        return waitFor(500).then(() => {
            return Date.now();
        });
    },
    {
        cache,
        cacheKeyPrefix: 'timestamp',
        cacheMode: CacheMode.Default,
        cacheMaxAge: 10,
        cacheMinFresh: 3,
    },
);

const echoFetcher = createFetcher(
    (request) => {
        return waitFor(500).then(() => {
            return request;
        });
    },
    {
        cache,
        cacheKeyPrefix: 'echo',
        cacheMode: CacheMode.NoStore,
    },
);

const listFetcher = createFetcher(
    (index) => {
        return waitFor(500).then(() => {
            return index + (Math.random() > 0.5 ? 1 : 0);
        });
    },
    {
        cache,
        cacheKeyPrefix: 'list',
        cacheMinFresh: 3,
        cacheMaxAge: 10,
    },
);

function App() {
    /**
     * basic swr use
     */
    const { data: swr, refresh, isFreshOrValidated } = useSWR(timestampFetcher, null, {
        retryOnError: true,
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
    const { data: polling, isPolling, start, stop } = usePolling(timestampFetcher, 2);

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
    /**
     * use the pagination list hook
     */
    const { list, isLoading, hasMore, loadMore, refresh: refreshList } = usePaginationListHook(0);

    return (
        <table>
            <tbody>
                <DemoBoard
                    title={'useSWR()'}
                    data={swr}
                    buttons={[{ title: 'refresh', onClick: refresh }]}
                />
                <DemoBoard title={'followed useSWR()'} data={swr2} />
                <DemoBoard
                    title={'usePolling()'}
                    data={JSON.stringify({ data: polling, isPolling })}
                    buttons={[
                        { title: 'start', onClick: start },
                        { title: 'stop', onClick: stop },
                    ]}
                />
                <DemoBoard
                    title={'usePaginationList()'}
                    data={JSON.stringify({ list, hasMore, isLoading })}
                    buttons={[
                        { title: 'loadMore', onClick: loadMore },
                        { title: 'refresh', onClick: refreshList },
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
            <td>{data ?? 'no data'}</td>
            <td>
                {buttons?.map((item, index) => {
                    return (
                        <button key={index} onClick={item.onClick}>
                            {item.title}
                        </button>
                    );
                })}
            </td>
        </tr>
    );
}

export default App;
