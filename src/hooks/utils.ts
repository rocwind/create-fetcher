import { useRef, useState, useCallback, MutableRefObject, useEffect } from 'react';
import debounce from 'lodash.debounce';
import isEqual from 'fast-deep-equal';

// Object.is - with +0 -0 case ignored
function is(x: unknown, y: unknown): boolean {
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

export function isEqualForKeys<T extends {}>(objA: T, objB: T, keys: (keyof T)[]): boolean {
    for (let i = 0; i < keys.length; i++) {
        if (!is(objA[keys[i]], objB[keys[i]])) {
            return false;
        }
    }
    return true;
}

export function isDeepEqual<T>(value1: T, value2: T): boolean {
    return isEqual(value1, value2);
}

/**
 * use memo instance if value is consider to be not changed during render by shallow equal comparsion
 * @param value
 * @returns
 */
export function useShallowEqualMemo<T>(value: T): T {
    const ref = useRef<T>();

    const isEqual = isShallowEqual(value, ref.current);
    useEffect(() => {
        if (!isEqual) {
            ref.current = value;
        }
    });

    return isEqual ? ref.current : value;
}

/**
 * use memo instance if value is consider to be not changed during render by deep equal comparsion
 * @param value
 * @returns
 */
export function useDeepEqualMemo<T>(value: T): T {
    const ref = useRef<T>();

    const isEqual = isDeepEqual(value, ref.current);
    useEffect(() => {
        if (!isEqual) {
            ref.current = value;
        }
    });

    return isEqual ? ref.current : value;
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

// delay the update by 34 ms(2 frames at 60fps) to render new state
// this gives time for loading cached data and skip
// the component rerender if the state doesn't change
const UPDATE_WAIT = 34;
/**
 * debounced state update/rerender
 * @returns [state, offscreenStateRef, updateState, cancel]
 */
export function useHookStateRef<T>(
    initialState: T,
): [T, MutableRefObject<T>, (fragment: Partial<T>) => void, () => void] {
    const rerender = useRerender();
    const onscreenStateRef = useRef<T>(initialState);
    const offscreenStateRef = useRef<T>(initialState);
    const update = useCallback(
        debounce(
            () => {
                if (isDeepEqual(onscreenStateRef.current, offscreenStateRef.current)) {
                    return;
                }
                onscreenStateRef.current = offscreenStateRef.current;
                rerender();
            },
            UPDATE_WAIT,
            {
                maxWait: UPDATE_WAIT,
                trailing: true,
            },
        ),
        [],
    );

    return [
        onscreenStateRef.current,
        offscreenStateRef,
        useCallback(
            (fragment: Partial<T>) => {
                offscreenStateRef.current = Object.assign(
                    {},
                    onscreenStateRef.current,
                    offscreenStateRef.current,
                    fragment,
                );
                update();
            },
            [update],
        ),
        useCallback(() => {
            update.cancel();
        }, [update]),
    ];
}
