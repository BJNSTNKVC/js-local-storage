import {
    KeyForgotFailed,
    KeyForgotten,
    KeyHit,
    KeyMissed,
    KeyWriteFailed,
    KeyWritten,
    LocalStorage,
    type LocalStorageEvent,
    type LocalStorageItem,
    RetrievingKey,
    StorageFlushed,
    StorageFlushing,
    WritingKey
} from '../../src/main';

// @ts-expect-error
const emit: typeof LocalStorage.emit = LocalStorage.emit;

// Returns the first event emitted by the listener from the mock call stack.
const getEventFromMockCalls: (listener: jest.Mock) => LocalStorageEvent[keyof LocalStorageEvent] = (listener: jest.Mock) => listener.mock.calls[0][0];

let events: Map<string, Event> = new Map();

beforeEach((): void => {
    LocalStorage.ttl(null);
    // @ts-expect-error
    LocalStorage.emit = jest.fn((event: Event) => events.set(event.type, event));
});

afterEach((): void => {
    LocalStorage.clear();
    LocalStorage.restore();

    events.clear();
});

describe('LocalStorage.ttl', (): void => {
    test('sets validity period', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const current: number = Date.now();

        LocalStorage.ttl(ttl);
        LocalStorage.set(key, value);

        const expiry: Date = LocalStorage.expiry(key) as Date;

        expect(expiry).toBeInstanceOf(Date);
        expect(expiry.getTime()).toBeCloseTo(current + ttl * 1000, -2);
    });

    test('sets validity period to null', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.ttl(null);
        LocalStorage.set(key, value);

        const expiry: null = LocalStorage.expiry(key) as null;

        expect(expiry).toBe(null);
    });
});

describe('LocalStorage.set', (): void => {
    test('sets the key to the Storage object', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        const result: boolean = LocalStorage.set(key, value);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem(key) as string) as LocalStorageItem;

        expect(result).toBeTruthy();
        expect(item.data).toEqual(value);
        expect(item.expiry).toEqual(null);
    });

    test('sets the key with a function value to the Storage object', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, (): string => value);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem(key) as string) as LocalStorageItem;

        expect(item.data).toEqual(value);
        expect(item.expiry).toEqual(null);
    });

    test('sets the key to the Storage object with an expiry based on the provided ttl', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const now: number = Date.now();

        LocalStorage.set(key, value, ttl);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem(key) as string) as LocalStorageItem;

        expect(item.data).toEqual(value);
        expect(item.expiry).toBe(now + ttl * 1000);
    });

    test('sets the key to the Storage object with an expiry based on the default ttl', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const now: number = Date.now();

        LocalStorage.ttl(60);
        LocalStorage.set(key, value);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem(key) as string) as LocalStorageItem;

        expect(item.data).toEqual(value);
        expect(item.expiry).toBeCloseTo(now + 60 * 1000, -2);
    });

    test('sets the key to the Storage object with an expiry overriding default', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 120;
        const now: number = Date.now();

        LocalStorage.ttl(60);
        LocalStorage.set(key, value, ttl);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem(key) as string) as LocalStorageItem;

        expect(item.data).toEqual(value);
        expect(item.expiry).toBe(now + ttl * 1000);
    });

    test('sets the key to the Storage object without expiry if ttl and default ttl are null', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.ttl(null);
        LocalStorage.set(key, value);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem(key) as string) as LocalStorageItem;

        expect(item.data).toEqual(value);
        expect(item.expiry).toEqual(null);
    });

    test('returns false in case value cannot be set', (): void => {
        const key: string = '$key';
        const value: string = 'x'.repeat(5 * 1024 * 1024);
        const result: boolean = LocalStorage.set(key, value);

        expect(result).toBeFalsy();
    });

    test('emits WritingKey event before setting the value', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const now: number = Date.now();

        LocalStorage.set(key, value, ttl);

        const event: WritingKey = events.get('local-storage:writing') as WritingKey;

        expect(events.has('local-storage:writing')).toBeTruthy();
        expect(event).toBeInstanceOf(WritingKey);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
        expect(event.expiry).toBe(now + ttl * 1000);
    });

    test('emits KeyWritten event after successful set operation', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const now: number = Date.now();

        LocalStorage.set(key, value, ttl);

        const event: KeyWritten = events.get('local-storage:written') as KeyWritten;

        expect(events.has('local-storage:written')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyWritten);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
        expect(event.expiry).toBe(now + ttl * 1000);
    });

    test('emits KeyWriteFailed event when storage insertion operation fails', (): void => {
        const key: string = '$key';
        const value: string = 'x'.repeat(5 * 1024 * 1024);
        const ttl: number = 60;
        const now: number = Date.now();

        LocalStorage.set(key, value, ttl);

        const event: KeyWriteFailed = events.get('local-storage:write-failed') as KeyWriteFailed;

        expect(events.has('local-storage:write-failed')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyWriteFailed);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
        expect(event.expiry).toBe(now + ttl * 1000);
    });
});

describe('LocalStorage.get', (): void => {
    test('returns the value for a key in Storage', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.get(key)).toEqual(value);
    });

    test('returns fallback value if key does not exist in Storage', (): void => {
        const key: string = '$key';
        const fallback: string = 'fallback';

        expect(LocalStorage.get(key, fallback)).toEqual(fallback);
    });

    test('returns fallback function result if key does not exist in Storage', (): void => {
        expect(LocalStorage.get('$key', (): string => 'fallback')).toEqual('fallback');
    });

    test('returns null if key does not exist and no fallback is provided', (): void => {
        expect(LocalStorage.get('$key')).toEqual(null);
    });

    test('returns null if item has expired', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = -60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.get(key)).toEqual(null);
    });

    test('removes the key from Storage if item has expired', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = -60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.get(key)).toEqual(null);
    });

    test('returns value if item has not expired', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.get(key)).toEqual(value);
    });

    test('emits RetrievingKey event before getting the value', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.get(key)).toEqual(value);

        const event: RetrievingKey = events.get('local-storage:retrieving') as RetrievingKey;

        expect(events.has('local-storage:retrieving')).toBeTruthy();
        expect(event).toBeInstanceOf(RetrievingKey);
        expect(event.key).toBe(key);
    });

    test('emits KeyHit event after successful get operation', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.get(key)).toEqual(value);

        const event: KeyHit = events.get('local-storage:hit') as KeyHit;

        expect(events.has('local-storage:hit')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyHit);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });

    test('emits KeyMissed event when storage retrieval operation fails', (): void => {
        const key: string = '$key';

        expect(LocalStorage.get(key)).toBeNull();

        const event: KeyMissed = events.get('local-storage:missed') as KeyMissed;

        expect(events.has('local-storage:missed')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyMissed);
        expect(event.key).toBe(key);
    });
});

describe('LocalStorage.remember', (): void => {
    test('returns the value for a key in Storage', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.remember(key, (): string => 'fallback')).toEqual(value);
    });

    test('stores and returns the result of the callback if key does not exist', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        expect(LocalStorage.remember(key, (): string => value)).toEqual(value);
        expect(LocalStorage.get(key)).toEqual(value);
    });

    test('stores and returns the result of the callback with an expiry if key does not exist', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;

        expect(LocalStorage.remember(key, (): string => value, ttl)).toEqual(value);
        expect(LocalStorage.get(key)).toEqual(value);
    });

    test('returns null if item has expired', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = -60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.remember(key, (): string => 'fallback')).toEqual('fallback');
    });

    test('removes the key from Storage if item has expired and stores callback result', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = -60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.remember(key, (): string => '_value')).toEqual('_value');
        expect(LocalStorage.get(key)).toEqual('_value');
    });

    test('returns stored value if item has not expired', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.remember(key, (): string => '_value')).toEqual(value);
    });

    test('stores and returns callback result with default ttl if provided', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 120;

        LocalStorage.ttl(ttl);

        expect(LocalStorage.remember(key, (): string => value)).toEqual(value);
        expect(LocalStorage.get(key)).toEqual(value);
    });
});

describe('LocalStorage.all', (): void => {
    test('retrieves all items from the Storage object', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string = '$key2';
        const value2: string = '$value2';

        LocalStorage.set(key2, value2);

        const items: { key: string, value: any }[] = LocalStorage.all();

        expect((items[0] as { key: string, value: any })).toEqual({ key: key1, value: value1 });
        expect(items[1] as { key: string, value: any }).toEqual({ key: key2, value: value2 });
    });

    test('retrieves an empty object if Storage is empty', (): void => {
        localStorage.clear();

        const items: object = LocalStorage.all();

        expect(items).toEqual([]);
    });
});

describe('LocalStorage.remove', (): void => {
    test('removes the key from Storage', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        const result: boolean = LocalStorage.remove(key);

        expect(result).toBeTruthy();
        expect(LocalStorage.get(key)).toEqual(null);
    });

    test('does nothing if the key does not exist in Storage', (): void => {
        const key: string = '$key';

        const result: boolean = LocalStorage.remove(key);

        expect(result).toBeFalsy();
        expect(LocalStorage.get(key)).toEqual(null);
    });

    test('emits KeyForgotten event after successful remove operation', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        LocalStorage.remove(key);

        const event: KeyForgotten = events.get('local-storage:forgot') as KeyForgotten;

        expect(events.has('local-storage:forgot')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyForgotten);
        expect(event.key).toBe(key);
    });

    test('emits KeyForgotFailed event when storage removal operation fails', (): void => {
        const key: string = '$key';

        LocalStorage.remove(key);

        const event: KeyForgotFailed = events.get('local-storage:forgot-failed') as KeyForgotFailed;

        expect(events.has('local-storage:forgot-failed')).toBeTruthy();
        expect(event).toBeInstanceOf(KeyForgotFailed);
        expect(event.key).toBe(key);
    });
});

describe('LocalStorage.clear', (): void => {
    test('clears all keys from Storage', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string = '$key2';
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
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = -60;

        LocalStorage.set(key, value, ttl);
        LocalStorage.clear();

        expect(LocalStorage.get(key)).toEqual(null);
    });

    test('emits StorageFlushing event before clearing all keys from Storage', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string = '$key2';
        const value2: string = '$value2';

        LocalStorage.set(key2, value2);

        LocalStorage.clear();

        const event: StorageFlushing = events.get('local-storage:flushing') as StorageFlushing;

        expect(events.has('local-storage:flushing')).toBeTruthy();
        expect(event).toBeInstanceOf(StorageFlushing);
    });

    test('emits StorageFlushed after clearing all keys from Storage', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string = '$key2';
        const value2: string = '$value2';

        LocalStorage.set(key2, value2);

        LocalStorage.clear();

        const event: StorageFlushed = events.get('local-storage:flushed') as StorageFlushed;

        expect(events.has('local-storage:flushed')).toBeTruthy();
        expect(event).toBeInstanceOf(StorageFlushed);
    });
});

describe('LocalStorage.has', (): void => {
    test('returns true if the key exists in Storage', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.has(key)).toEqual(true);
    });

    test('returns false if the key does not exist in Storage', (): void => {
        const key: string = '$key';

        expect(LocalStorage.has(key)).toEqual(false);
    });

    test('returns false if the item has expired', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = -60;

        LocalStorage.set(key, value, ttl);

        expect(LocalStorage.has(key)).toEqual(false);
    });

    test('returns true for items with no expiry', (): void => {
        const key: string = '$key';
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

describe('LocalStorage.missing', (): void => {
    test('returns true if the key does not exist in Storage', (): void => {
        const key: string = '$key';

        expect(LocalStorage.missing(key)).toBeTruthy();
    });

    test('returns false if the key exists in Storage', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.missing(key)).toBeFalsy();
    });
});

describe('LocalStorage.hasAny', (): void => {
    test('returns true if at least one of the keys exists in Storage', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string = '$key2';
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
        const key: string = '$key';
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
        const key1: string = '$key1';
        const value1: string = '$value1';
        const ttl: number = -60;

        LocalStorage.set(key1, value1, ttl);

        const key2: string = '$key2';
        const value2: string = '$value2';

        LocalStorage.set(key2, value2);

        expect(LocalStorage.hasAny([key1, key2])).toEqual(true);
    });

    test('returns false if none of the keys exist or are valid', (): void => {
        const key1: string = '$key1';
        const value1: string = '$value1';
        const ttl: number = -60;

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
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.isEmpty()).toEqual(false);
    });
});

describe('LocalStorage.isNotEmpty', (): void => {
    test('returns true if Storage has items', (): void => {
        const key: string = '$key';
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
        const key1: string = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string = '$key2';
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
        const key1: string = '$key1';
        const value1: string = '$value1';

        LocalStorage.set(key1, value1);

        const key2: string = '$key2';
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
        jest.useFakeTimers();

        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const start: number = 1_000_000;

        jest.setSystemTime(start);

        LocalStorage.set(key, value, ttl);

        jest.advanceTimersByTime(1000);
        jest.setSystemTime(start + 1000);

        LocalStorage.touch(key, ttl);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem(key) as string) as LocalStorageItem;

        expect(item.data).toEqual(value);
        expect(item.expiry).toEqual(start + 1000 + ttl * 1000);
    });

    test('does not update expiration if item does not exist', (): void => {
        const key: string = '$key';

        LocalStorage.touch(key, 60);

        expect(localStorage.getItem(key)).toEqual(null);
    });

    test('uses default TTL if provided TTL is null', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;

        LocalStorage.ttl(ttl);
        LocalStorage.set(key, value);

        jest.advanceTimersByTime(1000);

        const now: number = Date.now();

        LocalStorage.touch(key);

        const item: LocalStorageItem = JSON.parse(localStorage.getItem(key) as string) as LocalStorageItem;

        expect(item.data).toEqual(value);
        expect(item.expiry).toEqual(now + ttl * 1000);
    });
});

describe('LocalStorage.expiry', (): void => {
    test('returns the expiration as a Date object', (): void => {
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const current: number = Date.now();

        LocalStorage.set(key, value, ttl);

        const expiry: Date = LocalStorage.expiry(key) as Date;

        expect(expiry).toBeInstanceOf(Date);
        expect(expiry.getTime()).toBeCloseTo(current + ttl * 1000, -2);
    });

    test('returns null if the key does not exist in Storage', (): void => {
        const key: string = '$key';

        expect(LocalStorage.expiry(key)).toEqual(null);
    });

    test('returns null if the item has no expiration', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value, null);

        expect(LocalStorage.expiry(key)).toEqual(null);
    });
});

describe('LocalStorage.dump', (): void => {
    it('logs the stored item to the console', (): void => {
        const $console: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]> = jest.spyOn(console, 'log').mockImplementation();

        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);
        LocalStorage.dump(key);

        expect($console).toHaveBeenCalledWith(value);

        $console.mockRestore();
    });
});

describe('LocalStorage.fake', (): void => {
    test('sets fake as Storage instance', (): void => {
        LocalStorage.fake();

        expect(LocalStorage.isFake()).toBeTruthy();
    });

    test('interacts with fake Storage', (): void => {
        LocalStorage.fake();

        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.get(key)).toEqual(value);
        expect(LocalStorage.count()).toEqual(1);
        expect(LocalStorage.keys()).toContain(key);

        LocalStorage.clear();

        expect(LocalStorage.count()).toEqual(0);
    });


    test('sets new fake instance on multiple calls', (): void => {
        LocalStorage.fake();

        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        expect(LocalStorage.get(key)).toBe(value);
        expect(LocalStorage.count()).toBe(1);

        LocalStorage.fake();

        expect(LocalStorage.get(key)).toBeNull();
        expect(LocalStorage.count()).toBe(0);
    });
});

describe('LocalStorage.restore', (): void => {
    test('restores Storage instance', (): void => {
        LocalStorage.fake();

        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);

        LocalStorage.restore();

        expect(LocalStorage.isFake()).toBeFalsy();
        expect(LocalStorage.get(key)).toBeNull();
        expect(LocalStorage.count()).toBe(0);
    });
});

describe('LocalStorage.isFake', (): void => {
    test('returns true when fake Storage is set', (): void => {
        LocalStorage.fake();

        expect(LocalStorage.isFake()).toBeTruthy();
    });

    test('returns false when Storage is restored', (): void => {
        LocalStorage.fake();
        LocalStorage.restore();

        expect(LocalStorage.isFake()).toBeFalsy();
    });
});

describe('LocalStorage.listen', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "retrieving" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        LocalStorage.listen('retrieving', listener);
        LocalStorage.get(key);

        const event = getEventFromMockCalls(listener) as RetrievingKey;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(RetrievingKey);
        expect(event.key).toBe(key);
    });

    test('registers a listener for "hit" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.listen('hit', listener);
        LocalStorage.set(key, value);
        LocalStorage.get(key);

        const event: KeyHit = getEventFromMockCalls(listener) as KeyHit;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyHit);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });

    test('registers a listener for "missed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        LocalStorage.listen('missed', listener);
        LocalStorage.get(key);

        const event: KeyMissed = getEventFromMockCalls(listener) as KeyMissed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyMissed);
        expect(event.key).toBe(key);
    });

    test('registers a listener for "writing" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;
        const now: number = Date.now();

        LocalStorage.listen('writing', listener);
        LocalStorage.set(key, value, ttl);

        const event: WritingKey = getEventFromMockCalls(listener) as WritingKey;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(WritingKey);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
        expect(event.expiry).toBe(now + ttl * 1000);
    });

    test('registers a listener for "written" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.listen('written', listener);
        LocalStorage.set(key, value);

        const event: KeyWritten = getEventFromMockCalls(listener) as KeyWritten;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyWritten);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });

    test('registers a listener for "write-failed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = 'x'.repeat(5 * 1024 * 1024);
        const ttl: number = 60;

        LocalStorage.listen('write-failed', listener);
        LocalStorage.set(key, value, ttl);

        const event: KeyWriteFailed = getEventFromMockCalls(listener) as KeyWriteFailed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyWriteFailed);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });

    test('registers a listener for "forgot" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);
        LocalStorage.listen('forgot', listener);
        LocalStorage.remove(key);

        const event: KeyForgotten = getEventFromMockCalls(listener) as KeyForgotten;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyForgotten);
        expect(event.key).toBe(key);
    });

    test('registers a listener for "forgot-failed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        LocalStorage.listen('forgot-failed', listener);
        LocalStorage.remove(key);

        const event: KeyForgotFailed = getEventFromMockCalls(listener) as KeyForgotFailed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyForgotFailed);
        expect(event.key).toBe(key);
    });

    test('registers a listener for "flushing" event', (): void => {
        const listener: jest.Mock = jest.fn();

        LocalStorage.listen('flushing', listener);
        LocalStorage.clear();

        const event: StorageFlushing = getEventFromMockCalls(listener) as StorageFlushing;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(StorageFlushing);
    });

    test('registers a listener for "flushed" event', (): void => {
        const listener: jest.Mock = jest.fn();

        LocalStorage.listen('flushed', listener);
        LocalStorage.clear();

        const event: StorageFlushed = getEventFromMockCalls(listener) as StorageFlushed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(StorageFlushed);
    });

    test('registers multiple listeners at once', (): void => {
        const listeners: Record<keyof LocalStorageEvent, jest.Mock> = {
            'retrieving'   : jest.fn(),
            'hit'          : jest.fn(),
            'missed'       : jest.fn(),
            'writing'      : jest.fn(),
            'written'      : jest.fn(),
            'write-failed' : jest.fn(),
            'forgot'       : jest.fn(),
            'forgot-failed': jest.fn(),
            'flushing'     : jest.fn(),
            'flushed'      : jest.fn()
        };

        LocalStorage.listen(listeners);

        const key: string = '$key';
        const value: string = '$value';
        const ttl: number = 60;

        LocalStorage.get(key);

        expect(listeners['retrieving']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['retrieving'])).toBeInstanceOf(RetrievingKey);

        expect(listeners['missed']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['missed'])).toBeInstanceOf(KeyMissed);

        LocalStorage.set(key, value, ttl);

        expect(listeners['writing']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['writing'])).toBeInstanceOf(WritingKey);

        expect(listeners['written']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['written'])).toBeInstanceOf(KeyWritten);

        LocalStorage.set(key.repeat(5 * 1024 * 1024), value);

        expect(listeners['write-failed']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['write-failed'])).toBeInstanceOf(KeyWriteFailed);

        LocalStorage.get(key);

        expect(listeners['hit']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['hit'])).toBeInstanceOf(KeyHit);

        LocalStorage.remove(key);

        expect(listeners['forgot']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['forgot'])).toBeInstanceOf(KeyForgotten);

        LocalStorage.remove('$key-1');

        expect(listeners['forgot-failed']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['forgot-failed'])).toBeInstanceOf(KeyForgotFailed);

        LocalStorage.clear();

        expect(listeners['flushing']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['flushing'])).toBeInstanceOf(StorageFlushing);

        expect(listeners['flushed']).toHaveBeenCalledTimes(1);
        expect(getEventFromMockCalls(listeners['flushed'])).toBeInstanceOf(StorageFlushed);
    });
});

describe('LocalStorage.onRetrieving', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "retrieving" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        LocalStorage.onRetrieving(listener);
        LocalStorage.get(key);

        const event: RetrievingKey = getEventFromMockCalls(listener) as RetrievingKey;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(RetrievingKey);
        expect(event.key).toBe(key);
    });
});

describe('LocalStorage.onHit', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "hit" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);
        LocalStorage.onHit(listener);
        LocalStorage.get(key);

        const event: KeyHit = getEventFromMockCalls(listener) as KeyHit;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyHit);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });
});

describe('LocalStorage.onMissed', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "missed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        LocalStorage.onMissed(listener);
        LocalStorage.get(key);

        const event: KeyMissed = getEventFromMockCalls(listener) as KeyMissed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyMissed);
        expect(event.key).toBe(key);
    });
});

describe('LocalStorage.onWriting', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "writing" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.onWriting(listener);
        LocalStorage.set(key, value);

        const event: WritingKey = getEventFromMockCalls(listener) as WritingKey;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(WritingKey);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });
});

describe('LocalStorage.onWritten', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "written" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.onWritten(listener);
        LocalStorage.set(key, value);

        const event: KeyWritten = getEventFromMockCalls(listener) as KeyWritten;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyWritten);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });
});

describe('LocalStorage.onWriteFailed', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "write-failed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = 'x'.repeat(5 * 1024 * 1024); // Too large for localStorage

        LocalStorage.onWriteFailed(listener);
        LocalStorage.set(key, value);

        const event: KeyWriteFailed = getEventFromMockCalls(listener) as KeyWriteFailed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyWriteFailed);
        expect(event.key).toBe(key);
        expect(event.value).toBe(value);
    });
});

describe('LocalStorage.onForgot', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "forgot" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';
        const value: string = '$value';

        LocalStorage.set(key, value);
        LocalStorage.onForgot(listener);
        LocalStorage.remove(key);

        const event: KeyForgotten = getEventFromMockCalls(listener) as KeyForgotten;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyForgotten);
        expect(event.key).toBe(key);
    });
});

describe('LocalStorage.onForgotFailed', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "forgot-failed" event', (): void => {
        const listener: jest.Mock = jest.fn();
        const key: string = '$key';

        LocalStorage.onForgotFailed(listener);
        LocalStorage.remove(key);

        const event: KeyForgotFailed = getEventFromMockCalls(listener) as KeyForgotFailed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(KeyForgotFailed);
        expect(event.key).toBe(key);
    });
});

describe('LocalStorage.onFlushing', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "flushing" event', (): void => {
        const listener: jest.Mock = jest.fn();

        LocalStorage.onFlushing(listener);
        LocalStorage.clear();

        const event: StorageFlushing = getEventFromMockCalls(listener) as StorageFlushing;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(StorageFlushing);
    });
});

describe('LocalStorage.onFlushed', (): void => {
    // @ts-expect-error
    beforeEach((): void => LocalStorage.emit = emit);

    test('registers a listener for "flushed" event', (): void => {
        const listener: jest.Mock = jest.fn();

        LocalStorage.onFlushed(listener);
        LocalStorage.clear();

        const event: StorageFlushed = getEventFromMockCalls(listener) as StorageFlushed;

        expect(listener).toHaveBeenCalledTimes(1);
        expect(event).toBeInstanceOf(StorageFlushed);
    });
});