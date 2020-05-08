# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
