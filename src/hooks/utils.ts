import { useRef, useState, useCallback, MutableRefObject } from 'react';
import debounce from 'lodash.debounce';
import isEqual from 'lodash.isequal';

// Object.is - with +0 -0 case ignored
function is(x: any, y: any): boolean {
    if (x === y) {
        return true;
    } else {
        return x !== x && y !== y;
    }
}

// https://github.com/reduxjs/react-redux/blob/master/src/utils/shallowEqual.js
export function isShallowEqual<T>(objA: T, objB: T): boolean {
    if (is(objA, objB)) return true;

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (let i = 0; i < keysA.length; i++) {
        if (
            !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
            !is(objA[keysA[i]], objB[keysA[i]])
        ) {
            return false;
        }
    }

    return true;
}

export function useShallowEqualMemo<T>(value: T): T {
    const ref = useRef<T>();
    if (!isShallowEqual(value, ref.current)) {
        ref.current = value;
    }
    return ref.current;
}

export function isDeepEqual<T>(value1: T, value2: T): boolean {
    return isEqual(value1, value2);
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
        console.log('rerender called', Date.now(), new Error().stack);
        rerender({});
    }, [rerender]);
}

/**
 * debounced state update/rerender
 * @param state
 * @param wait
 * @param maxWait
 */
export function useRenderState<T>(state: MutableRefObject<T>, wait: number, maxWait: number) {
    const rerender = useRerender();
    return useCallback(
        debounce(
            (newState: T) => {
                if (isShallowEqual(state.current, newState)) {
                    return;
                }
                state.current = newState;
                rerender();
            },
            wait,
            {
                maxWait,
                trailing: true,
            },
        ),
        [wait, maxWait, rerender],
    );
}
