/* eslint-disable */
import React from 'react';
import { createFetcher, CacheMode } from 'create-fetcher';
import { useSWR, usePolling } from 'create-fetcher/lib/hooks';
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
        return waitFor(1000).then(() => {
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

function App() {
    const { data: swr, refresh } = useSWR(timestampFetcher, null, { retryOnError: true });
    const { data: polling, start, stop } = usePolling(timestampFetcher, 2);

    return (
        <table>
            <tbody>
                <DemoBoard
                    title={'useSWR()'}
                    data={swr}
                    buttons={[{ title: 'refresh', onClick: refresh }]}
                ></DemoBoard>
                <DemoBoard
                    title={'usePolling()'}
                    data={polling}
                    buttons={[
                        { title: 'start', onClick: start },
                        { title: 'stop', onClick: stop },
                    ]}
                ></DemoBoard>
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
                {buttons.map((item, index) => {
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
