# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.6.0](https://github.com/rocwind/create-fetcher/compare/v0.5.9...v0.6.0) (2021-09-16)


### ⚠ BREAKING CHANGES

* remove `createXXXHook()` and `useXXXCreator()` hooks

### Features

* support using url for usePolling() hook ([f748ab3](https://github.com/rocwind/create-fetcher/commit/f748ab3fef61f9ac478c402f63fbbe41e2fd3e4e))
* usePaginationList() supports using anonymouse listExtractor, nextRequestCreator ([137ccdc](https://github.com/rocwind/create-fetcher/commit/137ccdc11f0a6e0482aa9d3b46a878a2dc57fb21))


* usePaginationList() hook takes a DataHandler replace previous ListExtractor and NextRequestCreator params ([5fb5d4e](https://github.com/rocwind/create-fetcher/commit/5fb5d4e19b77c729d75f53dfd80d15efdfc78b64))

### [0.5.9](https://github.com/rocwind/create-fetcher/compare/v0.5.8...v0.5.9) (2021-08-24)


### Features

* support using url directly for createFetcher() and useSWR() ([949b54c](https://github.com/rocwind/create-fetcher/commit/949b54c1b8f9184d9ceac65df8f8bce1f6831cd5))

### [0.5.8](https://github.com/rocwind/create-fetcher/compare/v0.5.7...v0.5.8) (2021-07-12)


### Features

* add isRefreshing state to usePaginationList() ([2a883cb](https://github.com/rocwind/create-fetcher/commit/2a883cb41b7c10a1a7d06c8c776d92f763262774))


### Bug Fixes

* implement useRerender() by useReducer() ([9ca17eb](https://github.com/rocwind/create-fetcher/commit/9ca17ebdebc3749e36028f2dcfb0892c8164a788))

### [0.5.7](https://github.com/rocwind/create-fetcher/compare/v0.5.6...v0.5.7) (2021-06-03)


### Bug Fixes

* **hooks:** ignore abort error when update hooks state on error ([0c15a87](https://github.com/rocwind/create-fetcher/commit/0c15a87213121c242a582bc7186d251dbb9562b9))

### [0.5.6](https://github.com/rocwind/create-fetcher/compare/v0.5.5...v0.5.6) (2021-05-31)


### Bug Fixes

* revert "replace useEffect with useLayoutEffect for memo hooks" ([9c6eca2](https://github.com/rocwind/create-fetcher/commit/9c6eca2bd4076a383f4ce98d65a1c341b1348b6d))

### [0.5.5](https://github.com/rocwind/create-fetcher/compare/v0.5.4...v0.5.5) (2021-05-31)


### Bug Fixes

* **deps:** update jest, ts-jest to v27 ([bf0f295](https://github.com/rocwind/create-fetcher/commit/bf0f295bfda081a94dbcacf6061e75fbc6eb946a))
* **deps:** update object-hash to 2.2.0 ([577a3f4](https://github.com/rocwind/create-fetcher/commit/577a3f432b714bc74c017fc5acd94faf45b11332))
* export react utiles useRerender(), isDeepEqual(), isShallowEqual() ([8466119](https://github.com/rocwind/create-fetcher/commit/84661192bf848fe6ef0861442960515a367e51a2))
* replace useEffect with useLayoutEffect for memo hooks ([3e5df10](https://github.com/rocwind/create-fetcher/commit/3e5df104a2969b7eebde84e0af4fc674ee98665a))

### [0.5.4](https://github.com/rocwind/create-fetcher/compare/v0.5.3...v0.5.4) (2021-05-21)


### Bug Fixes

* expose useShallowEqualMemo(), useDeepEqualMemo() to hooks entry file ([c34385a](https://github.com/rocwind/create-fetcher/commit/c34385acd37fa5b326b95b6035d20c0a862daeb4))
* update ref value in useEffect() for memo hooks ([c1a747e](https://github.com/rocwind/create-fetcher/commit/c1a747e84e3c65d2b31c5a1862a519e39469f6c3))

### [0.5.3](https://github.com/rocwind/create-fetcher/compare/v0.5.2...v0.5.3) (2021-04-20)


### Bug Fixes

* use fast-deep-equal replace lodash.isequal ([8b3ab3e](https://github.com/rocwind/create-fetcher/commit/8b3ab3e0d79a8115039570e1f68f063138c3145c))

### [0.5.2](https://github.com/rocwind/create-fetcher/compare/v0.5.1...v0.5.2) (2021-03-16)


### Bug Fixes

* ignore request object prototype in default cache key ([f31bccf](https://github.com/rocwind/create-fetcher/commit/f31bccf7b7928be9d80dc97c43ce8815f06440d2))

### [0.5.1](https://github.com/rocwind/create-fetcher/compare/v0.5.0...v0.5.1) (2021-03-09)


### Features

* add getInitialResponse() util method ([c1adce9](https://github.com/rocwind/create-fetcher/commit/c1adce9d83911550b879b4af7c677deb5b283971))

## [0.5.0](https://github.com/rocwind/create-fetcher/compare/v0.4.0...v0.5.0) (2021-02-23)


### ⚠ BREAKING CHANGES

* **storage:** switch to @react-native-async-storage/async-storage package for async-storage

### Bug Fixes

* **storage:** switch to @react-native-async-storage/async-storage package for async-storage ([aa43079](https://github.com/rocwind/create-fetcher/commit/aa4307933eb7152fa789d0c15f7a06b178be0598))

## [0.4.0](https://github.com/rocwind/create-fetcher/compare/v0.3.13...v0.4.0) (2021-02-01)


### ⚠ BREAKING CHANGES

* FetcherOptions, RequestOptions, PaginationListOptions, PollingOptions, SWROptions are no longer generic classes

* update types, remove the use of any type and simplify Options types by remove generics ([2ad8cbd](https://github.com/rocwind/create-fetcher/commit/2ad8cbd7dbadda8011611d1b0f73829665168ae8))

### [0.3.13](https://github.com/rocwind/create-fetcher/compare/v0.3.12...v0.3.13) (2021-01-23)


### Bug Fixes

* usePaginationList() do not abort previous ongoing load request when loadMore() being called ([32f814b](https://github.com/rocwind/create-fetcher/commit/32f814b264bc8dee8b1ae1bd8c6ead5007bbbc66))

### [0.3.12](https://github.com/rocwind/create-fetcher/compare/v0.3.11...v0.3.12) (2020-12-04)


### Bug Fixes

* make log configurable for each request ([1a77de3](https://github.com/rocwind/create-fetcher/commit/1a77de38755eb7d3445190f403cb1f0a03d4102f))

### [0.3.11](https://github.com/rocwind/create-fetcher/compare/v0.3.10...v0.3.11) (2020-11-04)


### Bug Fixes

* **hooks:** useSWR resumes previous pending refresh request if it's aborted by rerender ([8603ce7](https://github.com/rocwind/create-fetcher/commit/8603ce781bab09f65c3e2649556ec6be6dde055b))

### [0.3.10](https://github.com/rocwind/create-fetcher/compare/v0.3.9...v0.3.10) (2020-10-28)


### Bug Fixes

* cache control should consider NoCache and NoStore cases as no fresh cache ([77f87e1](https://github.com/rocwind/create-fetcher/commit/77f87e1e1d5299a926a44bba64bee82c27e2a22b))

### [0.3.9](https://github.com/rocwind/create-fetcher/compare/v0.3.8...v0.3.9) (2020-10-28)


### Bug Fixes

* refresh@useSWR() will try to keep the most important refresh request with comparing the cacheMode ([38e5f4f](https://github.com/rocwind/create-fetcher/commit/38e5f4ff1f690537687ee20312a51f2f4e292a06))

### [0.3.8](https://github.com/rocwind/create-fetcher/compare/v0.3.7...v0.3.8) (2020-10-27)


### Features

* support CacheMode.ForceLoad ([9a0f22e](https://github.com/rocwind/create-fetcher/commit/9a0f22e2afd17c8964fe96ba5a7218ed0df1cae3))

### [0.3.7](https://github.com/rocwind/create-fetcher/compare/v0.3.6...v0.3.7) (2020-10-26)


### Bug Fixes

* swr hook should not abort previous request if new refresh call comes with the same request & options ([a7cbd13](https://github.com/rocwind/create-fetcher/commit/a7cbd13fa3a4476138e6b4a4a89248e2e3008faa))

### [0.3.6](https://github.com/rocwind/create-fetcher/compare/v0.3.5...v0.3.6) (2020-10-23)


### Bug Fixes

* useSWR may reset the state after response received ([a34b706](https://github.com/rocwind/create-fetcher/commit/a34b70689b354532278d262b0009592c3fee2a2d))

### [0.3.5](https://github.com/rocwind/create-fetcher/compare/v0.3.4...v0.3.5) (2020-10-20)


### Features

* optimize render performance for usePaginationList() ([561c3e1](https://github.com/rocwind/create-fetcher/commit/561c3e10bcba560f00941916a2aeeb5239c9460e))

### [0.3.4](https://github.com/rocwind/create-fetcher/compare/v0.3.3...v0.3.4) (2020-10-20)


### Bug Fixes

* remove debug log for rerender ([64a929b](https://github.com/rocwind/create-fetcher/commit/64a929bb27ca5a0cd7391686e82dbd4fe83e71bc))

### [0.3.3](https://github.com/rocwind/create-fetcher/compare/v0.3.2...v0.3.3) (2020-10-20)


### Features

* improve the refresh render performance for useSWR hook by skip unnecessary rerender ([5d4df2f](https://github.com/rocwind/create-fetcher/commit/5d4df2fcf1122d3962f4d6a55aff34d887c29ea0))


### Bug Fixes

* calling fetch() immediately after clearCache() on fetcher should not get cached response ([099fd10](https://github.com/rocwind/create-fetcher/commit/099fd10c502fe162b8c6a79f2c35b3825709e595))
* getFinalResponse() resolves if there is no error in last response ([0439372](https://github.com/rocwind/create-fetcher/commit/0439372850dc365a603daa905b80b96b47cc759e))

### [0.3.2](https://github.com/rocwind/create-fetcher/compare/v0.3.1...v0.3.2) (2020-09-24)


### Bug Fixes

* **types:** support `cacheKeyPrefix`, `cacheMinFresh`, `cacheMaxAge` in `RequestOptions` ([104dcc3](https://github.com/rocwind/create-fetcher/commit/104dcc34612e06f9af60cf06b2f6fbddb2f6ac56))

### [0.3.1](https://github.com/rocwind/create-fetcher/compare/v0.3.0...v0.3.1) (2020-09-19)


### Bug Fixes

* export state types for hooks ([0382da3](https://github.com/rocwind/create-fetcher/commit/0382da345fb7380b80bbd9596e573b02fcb74d0d))

## [0.3.0](https://github.com/rocwind/create-fetcher/compare/v0.2.8...v0.3.0) (2020-07-27)


### ⚠ BREAKING CHANGES

* remove cache key prefix delimiter `:`
* remove `retryOnError` option, use `retryTimes > 0` to turn on the retry
* forEachResponse() takes 2 params now - fetch() return and handler - and returns the abort() method

* remove `retryOnError` option, use `retryTimes > 0` to turn on the retry ([ad2a633](https://github.com/rocwind/create-fetcher/commit/ad2a633fe0e7fe40069bdba4eedb48bc024682e7))
* remove cache key prefix delimiter `:` ([273eef4](https://github.com/rocwind/create-fetcher/commit/273eef4f2c868a388c0efc84df1d7252bfc763c7))
* update the forEachResponse() util function ([e14c76c](https://github.com/rocwind/create-fetcher/commit/e14c76c13ef6bc07d9a5668e0d237bcbd7e2127c))

### [0.2.8](https://github.com/rocwind/create-fetcher/compare/v0.2.7...v0.2.8) (2020-05-30)


### Bug Fixes

* make request/options params optional for createXXXHook() ([bdf0816](https://github.com/rocwind/create-fetcher/commit/bdf0816de0b5d45664dc06fabc09b901409097eb))

### [0.2.7](https://github.com/rocwind/create-fetcher/compare/v0.2.6...v0.2.7) (2020-05-30)


### Bug Fixes

* correct SWR wrapper hook name ([74b8eef](https://github.com/rocwind/create-fetcher/commit/74b8eefbba3c4633f9e76943cabeb6baad394d27))

### [0.2.6](https://github.com/rocwind/create-fetcher/compare/v0.2.5...v0.2.6) (2020-05-30)


### Features

* add createXXXHook() and useXXXHookCreator() to hooks ([13cd1df](https://github.com/rocwind/create-fetcher/commit/13cd1dfa0e82ffc1bb0e808666094f6a1b9553fa))

### [0.2.5](https://github.com/rocwind/create-fetcher/compare/v0.2.4...v0.2.5) (2020-05-18)


### Bug Fixes

* expose the response data in usePaginationList() returns ([1a38f88](https://github.com/rocwind/create-fetcher/commit/1a38f883b6495e5a36e4620b6e21097f35e827b7))

### [0.2.4](https://github.com/rocwind/create-fetcher/compare/v0.2.3...v0.2.4) (2020-05-18)


### Features

* add `refresh()` and `manualStart` to `useSWR()` return / options ([19848c1](https://github.com/rocwind/create-fetcher/commit/19848c12fb213bbe69bdaa3d68088ab7189155f3))
* add clearCache() util function to prune cache by removing keys that older than given max age ([aa1e777](https://github.com/rocwind/create-fetcher/commit/aa1e77709407188cce41d56147b476ab8f957f13))
* add react hooks: usePaginationList() ([fce868b](https://github.com/rocwind/create-fetcher/commit/fce868b729e22a5450e040ff4b664e27d399b1d6))

### [0.2.3](https://github.com/rocwind/create-fetcher/compare/v0.2.2...v0.2.3) (2020-05-13)


### Bug Fixes

* fallbackToPureFetch() should throw on error ([416397b](https://github.com/rocwind/create-fetcher/commit/416397b68a11d10e33174fbfb16df502ebcb6ab3))

### [0.2.2](https://github.com/rocwind/create-fetcher/compare/v0.2.1...v0.2.2) (2020-05-09)

### [0.2.1](https://github.com/rocwind/create-fetcher/compare/v0.2.0...v0.2.1) (2020-05-08)


### Features

* add util function fallbackToPureFetch() ([cf3d1e2](https://github.com/rocwind/create-fetcher/commit/cf3d1e2296ce9cb438059c617b92f14811cdb6a3))

## [0.2.0](https://github.com/rocwind/create-fetcher/compare/v0.1.1...v0.2.0) (2020-04-01)


### ⚠ BREAKING CHANGES

* rename option `logger` to `log`

### Bug Fixes

* do not send remote request to revalidate cache for ForceCache ([d7f3891](https://github.com/rocwind/create-fetcher/commit/d7f389179f29a6d1900248ec6bc213cd94ee2dc3))


* rename option `logger` to `log` ([3b9fac6](https://github.com/rocwind/create-fetcher/commit/3b9fac630bbae70c1ec7143177d4dd39e777847c))

### [0.1.1](https://github.com/rocwind/create-fetcher/compare/v0.1.0...v0.1.1) (2020-03-29)


### Features

* add usePolling hook ([306f9a0](https://github.com/rocwind/create-fetcher/commit/306f9a0e4d74955a4613f9cf5a827d5de826409f))


### Bug Fixes

* add deep memo for request, options for hooks and use md5 hash for default cache key ([8d026d8](https://github.com/rocwind/create-fetcher/commit/8d026d87b6228d8833a3db3feeaf2fa8c6d1130b))

## [0.1.0](https://github.com/rocwind/create-fetcher/compare/v0.0.3...v0.1.0) (2020-03-28)


### ⚠ BREAKING CHANGES

* add BackoffMode.JitteredExponential and use it as default

### Features

* add BackoffMode.JitteredExponential and use it as default ([4646ba9](https://github.com/rocwind/create-fetcher/commit/4646ba921336cd6b09f7e30b2e7ff82f9e6191e7))
* add logger option to fetcher ([214595a](https://github.com/rocwind/create-fetcher/commit/214595a6c42cb4fbf20b76496cf144e11c0af588))
* implement the polling request ([8c1f0ab](https://github.com/rocwind/create-fetcher/commit/8c1f0ab42103630ef0ff2bc1422fe0f9c0e2b438))

### [0.0.3](https://github.com/rocwind/create-fetcher/compare/v0.0.2...v0.0.3) (2020-03-26)


### Features

* add clearCache() to fetcher ([a8ac9c5](https://github.com/rocwind/create-fetcher/commit/a8ac9c5d142d261690f832f92d6d937f5e13b59a))
* implement retry on error options ([c170314](https://github.com/rocwind/create-fetcher/commit/c170314cd66e370c1d16d790b0b5effc2641be92))


### Bug Fixes

* loading status should turn to false when request failed without any cached data ([693776d](https://github.com/rocwind/create-fetcher/commit/693776dfa01a02ba1cc68454e9f3f2959cf77dd8))
* skip swr resolve empty cache, wait for the network fetch returns for this case ([ada3e95](https://github.com/rocwind/create-fetcher/commit/ada3e95aa12a74144416cb3f26d091456d8796e5))
* swr response promise reject immediately after abort() being called ([26491c6](https://github.com/rocwind/create-fetcher/commit/26491c6de83956aa765cdf6bb444d0465b54f0d0))
* useSWR() hook keeps previous cached data even if followed revalidating request failed ([91df101](https://github.com/rocwind/create-fetcher/commit/91df101f397ae8bf8a2ac73cbda5d212e3bad7a9))

### [0.0.2](https://github.com/rocwind/create-fetcher/compare/v0.0.1...v0.0.2) (2020-03-21)


### Features

* add cache interface and implementations ([01b5271](https://github.com/rocwind/create-fetcher/commit/01b5271e2e7504a214d38017ddf4ed624058ca47))
* add useSWR() hook ([d510664](https://github.com/rocwind/create-fetcher/commit/d5106647da10335b1844aec6ec8b5608c6132e42))
* implement basic fetcher ([b8949cc](https://github.com/rocwind/create-fetcher/commit/b8949cc18d29223cb3e2fcb7332a796f15a26a32))


### Bug Fixes

* null check for fetch() without request and options and update docs ([0ee7ddc](https://github.com/rocwind/create-fetcher/commit/0ee7ddc4dff38949d92a9e26f0b27f580f2aed5e))

### 0.0.1 (2020-03-15)
