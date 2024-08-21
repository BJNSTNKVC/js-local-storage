// @ts-nocheck
require('../src/main');

class Storage {
    /**
     * Create a new Storage object.
     */
    constructor() {
        this.store = {};
    }

    /**
     * Returns an integer representing the number of data items stored in the Storage object.
     *
     * @return { number }
     */
    get length(): number {
        return Object.keys(this.store).length;
    }

    /**
     * When passed a key name, will return that key's value.
     *
     * @param { string } keyName
     * @return { any }
     */
    getItem(keyName: string): string {
        return this.store[keyName] || null;
    }

    /**
     * When passed a key name and value, will add that key to the storage, or update that key's value if it already exists.
     *
     * @param { string } keyName
     * @param { string } keyValue
     */
    setItem(keyName: string, keyValue: string) {
        this.store[keyName] = keyValue;
    }

    /**
     * When passed a key name, will remove that key from the storage.
     *
     * @param { string } keyName
     */
    removeItem(keyName: string) {
        delete this.store[keyName];
    }

    /**
     * When invoked, will empty all keys out of the storage.
     */
    clear() {
        this.store = {};
    }
}

const _global: any = global;

_global.localStorage = new Storage;

beforeEach((): void => {
    localStorage.clear();
    LocalStorage.ttl(null);
});

describe('LocalStorage.ttl', (): void => {
    test('sets validity period', (): void => {
        LocalStorage.ttl(60);
        expect(LocalStorage['_ttl']).toEqual(60);
    });

    test('sets validity period to null', (): void => {
        LocalStorage.ttl(null);
        expect(LocalStorage['_ttl']).toEqual(null);
    });
});

describe('LocalStorage.set', (): void => {
    test('sets the key to the Storage object', (): void => {
        LocalStorage.set('$key', '$value');

        const item: LocalStorageItem = JSON.parse(localStorage.getItem('$key'));

        expect(item.data).toEqual('$value');
        expect(item.expiry).toEqual(null);
    });

    test('sets the key with a function value to the Storage object', (): void => {
        LocalStorage.set('$key', () => '$value');

        const item: LocalStorageItem = JSON.parse(localStorage.getItem('$key'));

        expect(item.data).toEqual('$value');
        expect(item.expiry).toEqual(null);
    });

    test('sets the key to the Storage object with an expiry based on the provided ttl', (): void => {
        const ttl: number = 60;
        const now: number = Date.now();

        LocalStorage.set('$key', '$value', ttl);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem('$key'));

        expect(item.data).toEqual('$value');
        expect(item.expiry).toBe(now + ttl * 1000);
    });

    test('sets the key to the Storage object with an expiry based on the default ttl', (): void => {
        LocalStorage.ttl(60);

        const now: number = Date.now();

        LocalStorage.set('$key', '$value');

        const item: LocalStorageItem = JSON.parse(localStorage.getItem('$key'));

        expect(item.data).toEqual('$value');
        expect(item.expiry).toBe(now + 60 * 1000, 1);
    });

    test('sets the key to the Storage object with an expiry overriding default', (): void => {
        LocalStorage.ttl(60);

        const ttl: number = 120;
        const now: number = Date.now();

        LocalStorage.set('$key', '$value', ttl);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem('$key'));

        expect(item.data).toEqual('$value');
        expect(item.expiry).toBe(now + ttl * 1000);
    });

    test('sets the key to the Storage object without expiry if ttl and default ttl are null', (): void => {
        LocalStorage.ttl(null);
        LocalStorage.set('$key', '$value');

        const item: LocalStorageItem = JSON.parse(localStorage.getItem('$key'));

        expect(item.data).toEqual('$value');
        expect(item.expiry).toEqual(null);
    });
});

describe('LocalStorage.get', (): void => {
    test('returns the value for a key in Storage', (): void => {
        const key: string   = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.get(key)).toEqual(value);
    });

    test('returns fallback value if key does not exist in Storage', (): void => {
        const key: string      = '$key';
        const fallback: string = 'fallback';

        expect(LocalStorage.get(key, fallback)).toEqual(fallback);
    });

    test('returns fallback function result if key does not exist in Storage', (): void => {
        const key: string = '$key';

        expect(LocalStorage.get(key, (): string => 'fallback')).toEqual('fallback');
    });

    test('returns null if key does not exist and no fallback is provided', (): void => {
        const key: string = '$key';

        expect(LocalStorage.get(key)).toEqual(null);
    });

    test('returns null if item has expired', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = -60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.get(key)).toEqual(null);
    });

    test('removes the key from Storage if item has expired', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = -60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.get(key)).toEqual(null);
    });

    test('returns value if item has not expired', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = 60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.get(key)).toEqual(value);
    });
});

describe('LocalStorage.remember', (): void => {
    test('returns the value for a key in Storage', (): void => {
        const key: string   = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.remember(key, (): string => 'fallback')).toEqual(value);
    });

    test('stores and returns the result of the callback if key does not exist', (): void => {
        const key: string   = '$key';
        const value: string = '$value';

        expect(LocalStorage.remember(key, (): string => value)).toEqual(value);
        expect(LocalStorage.get(key)).toEqual(value);
    });

    test('stores and returns the result of the callback with an expiry if key does not exist', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = 60;

        expect(LocalStorage.remember(key, (): string => value, ttl)).toEqual(value);
        expect(LocalStorage.get(key)).toEqual(value);
    });

    test('returns null if item has expired', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = -60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.remember(key, (): string => 'fallback')).toEqual('fallback');
    });

    test('removes the key from Storage if item has expired and stores callback result', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = -60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.remember(key, (): string => '_value')).toEqual('_value');
        expect(LocalStorage.get(key)).toEqual('_value');
    });

    test('returns stored value if item has not expired', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = 60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.remember(key, (): string => '_value')).toEqual(value);
    });

    test('stores and returns callback result with default ttl if provided', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = 120;

        LocalStorage.ttl(ttl);

        expect(LocalStorage.remember(key, (): string => value)).toEqual(value);
        expect(LocalStorage.get(key)).toEqual(value);
    });
});

describe('LocalStorage.all', (): void => {
    test('retrieves all items from the Storage object', (): void => {
        const key1: string   = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string   = '$key2';
        const value2: string = '$value2';

        LocalStorage.set(key2, value2);

        const items: object = LocalStorage.all();

        expect(items[key1]).toEqual(value1);
        expect(items[key2]).toEqual(value2);
    });

    test('retrieves an empty object if Storage is empty', (): void => {
        localStorage.clear();

        const items: object = LocalStorage.all();

        expect(items).toEqual({});
    });
});

describe('LocalStorage.remove', (): void => {
    test('removes the key from Storage', (): void => {
        const key: string   = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);
        LocalStorage.remove(key);

        expect(LocalStorage.get(key)).toEqual(null);
    });

    test('does nothing if the key does not exist in Storage', (): void => {
        const key: string = '$key';

        LocalStorage.remove(key);

        expect(LocalStorage.get(key)).toEqual(null);
    });
});

describe('LocalStorage.clear', (): void => {
    test('clears all keys from Storage', (): void => {
        const key1: string   = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string   = '$key2';
        const value2: string = '$value2';

        LocalStorage.set(key2, value2);

        LocalStorage.clear();

        expect(localStorage.getItem(key1)).toEqual(null);
        expect(localStorage.getItem(key2)).toEqual(null);
    });

    test('does nothing if Storage is already empty', (): void => {
        localStorage.clear();
        LocalStorage.clear();

        expect(localStorage.length).toBe(0);
    });

    test('clears items that have expired', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = -60;

        LocalStorage.set(key, value, ttl);
        LocalStorage.clear();

        expect(LocalStorage.get(key)).toEqual(null);
    });
});

describe('LocalStorage.has', (): void => {
    test('returns true if the key exists in Storage', (): void => {
        const key: string   = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.has(key)).toEqual(true);
    });

    test('returns false if the key does not exist in Storage', (): void => {
        const key: string = '$key';

        expect(LocalStorage.has(key)).toEqual(false);
    });

    test('returns false if the item has expired', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = -60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.has(key)).toEqual(false);
    });

    test('returns true for items with no expiry', (): void => {
        const key: string   = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.has(key)).toEqual(true);
    });

    test('returns false for an empty Storage', (): void => {
        LocalStorage.clear();

        const key: string = '$key';

        expect(LocalStorage.has(key)).toEqual(false);
    });
});

describe('LocalStorage.hasAny', (): void => {
    test('returns true if at least one of the keys exists in Storage', (): void => {
        const key1: string   = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string   = '$key2';
        const value2: string = '$value2';

        LocalStorage.set(key2, value2);

        expect(LocalStorage.hasAny([key1, key2])).toEqual(true);
    });

    test('returns false if none of the keys exist in Storage', (): void => {
        const key1: string = '$key1';
        const key2: string = '$key2';

        expect(LocalStorage.hasAny([key1, key2])).toEqual(false);
    });

    test('returns true if at least one of the keys exists in Storage when provided as individual arguments', (): void => {
        const key: string   = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.hasAny(key, 'anotherKey')).toEqual(true);
    });

    test('returns false if none of the keys exist in Storage when provided as individual arguments', (): void => {
        const key1: string = '$key1';
        const key2: string = '$key2';

        expect(LocalStorage.hasAny(key1, key2)).toEqual(false);
    });

    test('returns true if at least one of the keys exists when some keys are expired', (): void => {
        const key1: string   = '$key1';
        const value1: string = '$value1';
        const ttl: number    = -60;

        LocalStorage.set(key1, value1, ttl);

        const key2: string   = '$key2';
        const value2: string = '$value2';

        LocalStorage.set(key2, value2);

        expect(LocalStorage.hasAny([key1, key2])).toEqual(true);
    });

    test('returns false if none of the keys exist or are valid', (): void => {
        const key1: string   = '$key1';
        const value1: string = '$value1';
        const ttl: number    = -60;

        LocalStorage.set(key1, value1, ttl);

        const key2: string = '$key2';

        expect(LocalStorage.hasAny([key1, key2])).toEqual(false);
    });
});

describe('LocalStorage.isEmpty', (): void => {
    test('returns true if Storage is empty', (): void => {
        LocalStorage.clear();

        expect(LocalStorage.isEmpty()).toEqual(true);
    });

    test('returns false if Storage has items', (): void => {
        const key: string   = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.isEmpty()).toEqual(false);
    });
});

describe('LocalStorage.isNotEmpty', (): void => {
    test('returns true if Storage has items', (): void => {
        const key: string   = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.isNotEmpty()).toEqual(true);
    });

    test('returns false if Storage is empty', (): void => {
        LocalStorage.clear();

        expect(LocalStorage.isNotEmpty()).toEqual(false);
    });
});

describe('LocalStorage.keys', (): void => {
    test('retrieves all keys from Storage', (): void => {
        const key1: string   = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string   = '$key2';
        const value2: string = '$value2';

        LocalStorage.set(key2, value2);

        const keys: string[] = LocalStorage.keys();

        expect(keys).toContain(key1);
        expect(keys).toContain(key2);

        expect(keys.length).toBe(2);
    });

    test('returns an empty array if Storage is empty', (): void => {
        LocalStorage.clear();

        expect(LocalStorage.keys()).toEqual([]);
    });
});

describe('LocalStorage.count', (): void => {
    test('returns the total number of items in Storage', (): void => {
        const key1: string   = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string   = '$key2';
        const value2: string = '$value2';

        LocalStorage.set(key2, value2);

        expect(LocalStorage.count()).toBe(2);
    });

    test('returns 0 if Storage is empty', (): void => {
        LocalStorage.clear();

        expect(LocalStorage.count()).toBe(0);
    });
});

describe('LocalStorage.touch', (): void => {
    test('updates the item expiration time', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = 60;

        LocalStorage.set(key, value, ttl);

        jest.advanceTimersByTime(1000);

        const now: number = Date.now();

        LocalStorage.touch(key, ttl);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem(key));

        expect(item.data).toEqual(value);
        expect(item.expiry).toEqual(now + ttl * 1000);
    });

    test('does not update expiration if item does not exist', (): void => {
        const key: string = '$key';

        LocalStorage.touch(key, 60);

        expect(localStorage.getItem(key)).toEqual(null);
    });

    test('uses default TTL if provided TTL is null', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = 60;

        LocalStorage.ttl(ttl);
        LocalStorage.set(key, value);

        jest.advanceTimersByTime(1000);

        const now: number = Date.now();

        LocalStorage.touch(key);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem(key));

        expect(item.data).toEqual(value);
        expect(item.expiry).toEqual(now + ttl * 1000);
    });
});

describe('LocalStorage.expiry', (): void => {
    test('returns the expiration as a timestamp', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = 60;
        LocalStorage.set(key, value, ttl);

        const expiry: number | null = LocalStorage.expiry(key) as number;

        expect(expiry).toBeCloseTo(Date.now() + ttl * 1000, 1);
    });

    test('returns the expiration as a Date object when asDate is true', (): void => {
        const key: string   = '$key';
        const value: string = '$value';
        const ttl: number   = 60;

        LocalStorage.set(key, value, ttl);

        const expiry: Date | null = LocalStorage.expiry(key, true) as Date;

        expect(expiry).toBeInstanceOf(Date);
        expect(expiry?.getTime()).toBeCloseTo(Date.now() + ttl * 1000, 1);
    });

    test('returns null if the key does not exist in Storage', (): void => {
        const key: string = '$key';

        expect(LocalStorage.expiry(key)).toEqual(null);
    });

    test('returns null if the item has no expiration', (): void => {
        const key: string   = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value, null);

        expect(LocalStorage.expiry(key)).toEqual(null);
    });
});
