/* eslint-disable */
import React from 'react';
import { createFetcher, CacheMode } from 'create-fetcher';
import { useSWR, usePolling } from 'create-fetcher/lib/hooks';
import { createLocalStorageCache } from 'create-fetcher/lib/caches/localStorage';
import './App.css';

const fetcher = createFetcher(
    (_, { signal }) => {
        const url = `${location.protocol}//${location.host}/manifest.json`;
        return fetch(url, { signal })
            .then(res => res.json())
            .then(() => {
                return Date.now();
            });
    },
    {
        cache: createLocalStorageCache('@fetcher'),
        cacheKeyPrefix: 'manifest',
        cacheMode: CacheMode.Default,
        cacheMaxAge: 10,
        cacheMinFresh: 3,
    },
);

function DemoBoard({ data, buttons }) {
    return (
        <div>
            <div>{data}</div>
            {buttons.map((item, index) => {
                return (
                    <button key={index} onClick={item.onClick}>
                        {item.title}
                    </button>
                );
            })}
        </div>
    );
}

function App() {
    const { data: swr } = useSWR(fetcher, null, { retryOnError: true });
    const { data: polling, start, stop } = usePolling(fetcher, 2);

    return (
        <div className="App">
            <DemoBoard data={swr} buttons={[]}></DemoBoard>
            <DemoBoard
                data={polling}
                buttons={[
                    { title: 'start', onClick: start },
                    { title: 'stop', onClick: stop },
                ]}
            ></DemoBoard>
        </div>
    );
}

export default App;
