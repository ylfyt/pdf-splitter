import { get, writable, type Subscriber, type Unsubscriber, type Updater, type Writable } from 'svelte/store';

let init = false;
const subscribers: { [key: string]: { sub: Subscriber<any>; set: (value: any) => void; key: string; default: any } } =
    {};

const updateHref = () => {
    const param = new URLSearchParams(window.location.search);
    for (const key in subscribers) {
        const fn = subscribers[key];
        let val = param.get(fn.key);
        if (!val) {
            val = fn.default;
        }
        if (typeof fn.default === 'string') {
            fn.set(val);
            fn.sub(val);
        } else {
            let newVal = parseInt(val!);
            if (isNaN(newVal)) {
                newVal = fn.default;
            }
            fn.set(newVal);
            fn.sub(newVal);
        }
    }
};

const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;
function setupListener() {
    if (init) return;
    init = true;

    history.pushState = function (data: any, unused: string, url?: string | URL | null | undefined) {
        originalPushState.apply(this, [data, unused, url]);
        updateHref();
    };
    history.replaceState = function (data: any, unused: string, url?: string | URL | null | undefined) {
        originalReplaceState.apply(this, [data, unused, url]);
        updateHref();
    };
}
function removeListener() {
    if (!init) return;
    init = false;
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
}

export function useUrlQuery<T extends number | string>(key: string, defaultVal: T, placeOnInit?: boolean): Writable<T> {
    const store = writable<T>(defaultVal);
    const { set: setStore } = store;

    const param = new URLSearchParams(window.location.search);
    const val = param.get(key);
    if (val) {
        if (typeof defaultVal === 'string') {
            setStore(val as T);
        } else {
            setStore(isNaN(parseInt(val)) ? defaultVal : (parseInt(val) as T));
        }
    } else {
        setStore(defaultVal);
        if (placeOnInit) {
            param.set(key, defaultVal?.toString() ?? '');
            window.history.replaceState(null, '', `?${param.toString()}`);
        }
    }

    const setAll = (value: T) => {
        let foundKey: string | undefined = undefined;
        for (const fnKey in subscribers) {
            const fn = subscribers[fnKey];
            if (key !== fn.key) continue;
            foundKey = fnKey;
            if (value == null) {
                value = fn.default;
            }
            fn.set(value);
        }
        const urlParam = new URLSearchParams(window.location.search);
        if (!foundKey || (urlParam.get(subscribers[foundKey].key) == null && value === subscribers[foundKey].default)) {
            return;
        }
        urlParam.set(key, value?.toString() ?? '');
        window.history.replaceState(null, '', `?${urlParam.toString()}`);
    };

    let idx = -1;
    return {
        subscribe: (fn: Subscriber<T>): Unsubscriber => {
            fn(get(store));
            idx = Math.random() * 10;
            subscribers[idx] = {
                set: setStore,
                sub: fn,
                key,
                default: defaultVal
            };

            setupListener();
            return () => {
                if (subscribers[key]) {
                    delete subscribers[idx];
                }
                if (Object.keys(subscribers).length === 0) {
                    removeListener();
                }
            };
        },
        set: (value: any) => {
            setAll(value);
        },
        update: (updater: Updater<T>) => {
            const value = updater(get(store));
            setAll(value);
        }
    };
}
