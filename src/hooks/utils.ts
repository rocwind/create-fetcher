import { useRef, useState, useCallback } from 'react';
import hash from 'object-hash';

export function isDeepEqual<T>(value1: T, value2: T): boolean {
    if (value1 === value2) {
        return true;
    }
    if (typeof value1 !== 'object' || typeof value2 !== 'object') {
        return false;
    }
    // compare objects by their hash
    return hash.MD5(value1) === hash.MD5(value2);
}

export function useDeepEqualMemo<T>(value: T): T {
    const ref = useRef<T>();
    if (!isDeepEqual(value, ref.current)) {
        ref.current = value;
    }
    return ref.current;
}

/**
 * hack rerender trigger
 */
export function useRerender(): () => void {
    const rerender = useState(null)[1];
    return useCallback(() => {
        rerender({});
    }, [rerender]);
}
