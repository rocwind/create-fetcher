import AsyncStorage from '@react-native-community/async-storage';
import { Cache } from '../types';
import { withMemoryCache } from './memory';
import { KeyPrefixHelper, defaultPrefix } from './utils';

class AsyncStorageCache<T> implements Cache<T> {
    private prefixHelper: KeyPrefixHelper;
    // keep a local cache of all keys
    private keys: Set<string>;

    constructor(keyPrefix: string) {
        this.prefixHelper = new KeyPrefixHelper(keyPrefix);
    }

    get(key: string): Promise<T | undefined> {
        if (this.keys && !this.keys.has(key)) {
            return Promise.resolve(undefined);
        }

        return AsyncStorage.getItem(this.prefixHelper.appendPrefix(key)).then(strValue => {
            if (!strValue) {
                return Promise.resolve(undefined);
            }

            try {
                const value = JSON.parse(strValue);
                return Promise.resolve(value);
            } catch (err) {
                // failed to parse, do nothing
            }
            return Promise.resolve(undefined);
        });
    }

    set(key: string, value: T): Promise<void> {
        const strValue = JSON.stringify(value);
        return AsyncStorage.setItem(this.prefixHelper.appendPrefix(key), strValue).then(() => {
            if (this.keys) {
                this.keys.add(key);
            }
        });
    }
    remove(key: string): Promise<void> {
        return AsyncStorage.removeItem(this.prefixHelper.appendPrefix(key)).then(() => {
            if (this.keys) {
                this.keys.delete(key);
            }
        });
    }
    getKeys(): Promise<string[]> {
        if (this.keys) {
            return Promise.resolve(Array.from(this.keys));
        }

        // search from storage if there is no local cache
        return AsyncStorage.getAllKeys().then(keys => {
            const matched = keys
                .filter(key => this.prefixHelper.matchPrefix(key))
                .map(key => this.prefixHelper.removePrefix(key));
            this.keys = new Set();
            matched.forEach(key => this.keys.add(key));
            return matched;
        });
    }
    clear(): Promise<void> {
        return this.getKeys().then(keys => {
            if (this.keys) {
                this.keys.clear();
            }
            return AsyncStorage.multiRemove(keys.map(key => this.prefixHelper.appendPrefix(key)));
        }) as Promise<void>;
    }
}

export default function createAsyncStorageCache<T>(
    keyPrefix: string = defaultPrefix,
    useMemoryCache: boolean = true,
): Cache<T> {
    const cache = new AsyncStorageCache<T>(keyPrefix);
    return useMemoryCache ? withMemoryCache(cache) : cache;
}
