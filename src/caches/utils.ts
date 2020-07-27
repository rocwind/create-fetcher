export class KeyPrefixHelper {
    private prefix: string;
    constructor(prefix: string) {
        this.prefix = prefix;
    }

    matchPrefix(key: string) {
        return key.startsWith(this.prefix);
    }

    appendPrefix(key: string) {
        return `${this.prefix}${key}`;
    }

    removePrefix(key: string) {
        return key.slice(this.prefix.length);
    }
}

export const defaultPrefix = '@fetcher:';
