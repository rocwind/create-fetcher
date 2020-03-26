# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
