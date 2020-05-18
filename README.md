# create-fetcher
create-fetcher is a remote data fetching library, providing common features - configurable caching, retry, polling with both promised-based API and react hooks.

## Install
`npm i --save create-fetcher`

## Usage
Please check out [example project](examples/react) for a usage demo.

### Plain Fetcher
```
import { createFetcher, forEachResponse } from 'create-fetcher';

const userInfoFetcher = createFetcher((id, { signal }) => fetch(`/api/v1/users/${id}`, { signal }));

userInfoFetcher.fetch(1).response.then(forEachResponse(({ data, error }) => {
    if (data !== undefined) {
        // deal with received data, either from valid cache or remote server ...
        console.log(data);
    }

    if (error) {
        // deal with error ...
        console.warn(error);
    }
}));
```

### React Hooks
```
import { useSWR } from 'create-fetcher/lib/hooks';

function MyComponent() {
    const { data } = useSWR(userInfoFetcher, 1);

    return (<div>{data}</div>);
}
```

## Caches
<to be added>
