# create-fetcher


## Install
`npm i --save create-fetcher`

## Usage
### Plain Fetcher
```
import { createFetcher } from 'create-fetcher';

const userInfoFetcher = createFetcher((id) => fetch(`/api/v1/users/${id}`));

const handleUserInfo = ({ data, next, error }) => {
    if (data) {
        // deal with received data ...
        console.log(data);
    }

    if (error) {
        // deal with error ...
        console.warn(error);
    }

    if (next) {
        // handle revalidated, polling or retry result
        next.then(handleUserInfo);
    }

}

userInfoFetcher.fetch(1).response.then(handleUserInfo);
```

### React Hooks
```
// To be added in next versions
```
