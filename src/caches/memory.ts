import { Cache } from '../types';

class MemoryCache<T> implements Cache<T> {
    // mem cache
    private valueByKey = new Map<string, T>();

    /**
     *
     * @param storage L2 cache
     */
    constructor(private storage: Cache<T>) {}

    get(key: string): Promise<T | null | undefined> {
        if (this.valueByKey.has(key)) {
            return Promise.resolve(this.valueByKey.get(key));
        }
        return this.storage.get(key).then(value => {
            // mem cache version is always newer and should be used
            if (this.valueByKey.has(key)) {
                return this.valueByKey.get(key);
            }
            // load to mem cache
            this.valueByKey.set(key, value);
            return value;
        });
    }

    set(key: string, value: T): Promise<void> {
        this.valueByKey.set(key, value);
        return this.storage.set(key, value);
    }

    remove(key: string): Promise<void> {
        // keep the key in mem cache, key = undefined indicates the key was loaded from L2 cache
        //  so it won't bother to load it again in get()
        this.valueByKey.set(key, undefined);
        return this.storage.remove(key);
    }

    getKeys(): Promise<string[]> {
        return this.storage.getKeys();
    }

    clear(): Promise<void> {
        // clear all map keys
        this.valueByKey.forEach((value, key) => {
            if (value === undefined) {
                return;
            }
            this.valueByKey.set(key, undefined);
        });
        return this.storage.clear();
    }
}

export function withMemoryCache<T>(cache: Cache<T>): Cache<T> {
    return new MemoryCache(cache);
}

class DummyCache<T> implements Cache<T> {
    private keys = new Set<string>();

    get(key: string): Promise<T | undefined> {
        return Promise.resolve(undefined);
    }

    set(key: string, value: T): Promise<void> {
        this.keys.add(key);
        return Promise.resolve();
    }
    remove(key: string): Promise<void> {
        this.keys.delete(key);
        return Promise.resolve();
    }
    getKeys(): Promise<string[]> {
        return Promise.resolve(Array.from(this.keys));
    }
    clear(): Promise<void> {
        this.keys.clear();
        return Promise.resolve();
    }
}

export function createMemoryCache<T>(): Cache<T> {
    return withMemoryCache(new DummyCache());
}
