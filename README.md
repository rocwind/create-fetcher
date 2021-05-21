# create-fetcher ![Node.js CI](https://github.com/rocwind/create-fetcher/workflows/Node.js%20CI/badge.svg)
create-fetcher is a remote data fetching library, providing common features - configurable caching, retry, polling with both promised-based API and react hooks.

## Install
`npm i --save create-fetcher`

## Why fetcher?
`create-fetcher` is built around the standard [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), the goal of this library is not trying to replace `fetch()` (like `axios`), but to provide common utilities around the remote data fetching:
- configurable caching strategies: [cache mode](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache) and `maxAge`, `minFresh`
- configurable cache stores: memory cache, local storage cache, async storage cache(react-native) or any custom cache stores that implement the `Cache` interface
- retry on failure
- polling (can be used together with retry on failure)
- request concurrency control: if a fetch request was triggered before another same request(share the same cacheKey) finished, they will be merged together, once 1 actual fetch request.
- built-in React hooks integration support: `useSWR()`, `usePolling()`, `usePaginationList()`

## Basic concepts and quick start example
* `fetcher`: object instance that responsible for making fetch calls, the reason it is need to be a object is for concurrency control

```
import { createFetcher } from 'create-fetcher';
import { useSWR } from 'create-fetcher/lib/hooks';

// create the fetcher instance, pass signal to fetch so it supports fully abort() the request
// otherwise calling abort() on `fetcher.fetch()` returns only aborts at application side (ignores request result).
const userInfoFetcher = createFetcher((id, { signal }) => fetch(`/api/v1/users/${id}`, { signal }));

function MyComponent() {
    // send request by useSWR with 1 as the id, and get the fetch result
    const { data } = useSWR(userInfoFetcher, 1);
    return (<div>{JSON.stringify(data)}</div>);
}
```
## Usage
Please check out [example project(react)](examples/react) for a usage demo.

## API List (please use the TypeScript docs for more details)

* `createFetcher(requestCreator, options)`: create a fetcher instance

### React Hooks (lib/hooks)
* `useSWR(fetcher, request, options)`, `createSWRHook(fetcher)`, `useSWRHookCreator(fetcher)`: basic request hook that supports caching, retry on failure
* `usePolling(fetcher, pollingWaitTime, request, options)`, `createPollingHook(fetcher, pollingWaitTime)`, `usePollingHookCreator(fetcher, pollingWaitTime)`: polling request hook
* `usePaginationList(fetcher, listExtractor, nextRequestCreator, initialRequest, options)`, `createPaginationListHook(fetcher, listExtractor, nextRequestCreator)`, `usePaginationListHookCreator(fetcher, listExtractor, nextRequestCreator)`: for making pagination list request calls and merges the results into a single list
*

### Caches (lib/caches)
* `createMemoryCache()`: in-memory cache
* `createLocalStorageCache(keyPrefix, useMemoryCache)`: use localStorage as cache store
* `createAsyncStorageCache(keyPrefix, useMemoryCache)`: for react-native, use AsyncStorage as cache store

### Utilities to work with plain fetcher object
* `forEachResponse(requestReturn, handler)`: callback for each request response, including response retrived from cache
* `getFinalResponse(requestReturn)`: get the final response
* `getInitialResponse(requestReturn)`: get thee first valid response, including response retrived from cache
* `fallbackToPureFetch(fetcher)`: turn fetcher into a pure fetch function
* `clearCache(cache, maxAge)`: clear expired items from cache
