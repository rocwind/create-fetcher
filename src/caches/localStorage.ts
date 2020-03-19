import { Cache } from '../types';
import { withMemoryCache } from './memory';
import { KeyPrefixHelper, defaultPrefix } from './utils';

class LocalStorageCache<T> implements Cache<T> {
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
        const strValue = localStorage.getItem(this.prefixHelper.appendPrefix(key));
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
    }

    set(key: string, value: T): Promise<void> {
        const strValue = JSON.stringify(value);
        localStorage.setItem(this.prefixHelper.appendPrefix(key), strValue);
        if (this.keys) {
            this.keys.add(key);
        }
        return Promise.resolve();
    }
    remove(key: string): Promise<void> {
        localStorage.removeItem(this.prefixHelper.appendPrefix(key));
        if (this.keys) {
            this.keys.delete(key);
        }
        return Promise.resolve();
    }
    getKeys(): Promise<string[]> {
        if (!this.keys) {
            this.keys = new Set();
            // search from localStorage if there is no local cache
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (this.prefixHelper.matchPrefix(key)) {
                    this.keys.add(this.prefixHelper.removePrefix(key));
                }
            }
        }
        return Promise.resolve(Array.from(this.keys));
    }
    clear(): Promise<void> {
        return this.getKeys().then(keys => {
            if (this.keys) {
                this.keys.clear();
            }
            return Promise.all(keys.map(key => this.remove(key)));
        }) as Promise<void>;
    }
}

export default function createLocalStorageCache<T>(
    keyPrefix: string = defaultPrefix,
    useMemoryCache: boolean = true,
): Cache<T> {
    const cache = new LocalStorageCache<T>(keyPrefix);
    return useMemoryCache ? withMemoryCache(cache) : cache;
}
