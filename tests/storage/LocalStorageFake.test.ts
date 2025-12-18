import { LocalStorageFake } from '../../src/main';

type StorageItem = {
    key: string,
    value: string
}

let storage: Storage;

const items: StorageItem[] = [
    { key: '$key1', value: '$value1' },
    { key: '$key2', value: '$value2' },
];

beforeEach((): LocalStorageFake => storage = new LocalStorageFake());

describe('LocalStorageFake', (): void => {
    test('satisfies Storage interface', (): void => {
        expect(typeof storage.setItem).toBe('function');
        expect(typeof storage.getItem).toBe('function');
        expect(typeof storage.removeItem).toBe('function');
        expect(typeof storage.clear).toBe('function');
        expect(typeof storage.key).toBe('function');
        expect(typeof storage.length).toBe('number');
    });
});

describe('LocalStorageFake.setItem', (): void => {
    test('sets an item', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        storage.setItem(key, value);

        expect(storage.getItem(key)).toBe(value);
    });

    test('updates an existing item', (): void => {
        const key: string = '$key';
        const value1: string = '$value1';
        const value2: string = '$value2';

        storage.setItem(key, value1);
        storage.setItem(key, value2);

        expect(storage.getItem(key)).toBe(value2);
    });

    test('handles different value types as strings', (): void => {
        const items: { key: string; value: any, expected?: string }[] = [
            { key: 'number', value: '123' },
            { key: 'boolean', value: 'true' },
            { key: 'array', value: [1, 2, 3], expected: '1,2,3' },
            { key: 'object', value: { 'key': 'value' }, expected: '[object Object]' },
            { key: 'undefined', value: undefined, expected: 'undefined' },
            { key: 'null', value: null, expected: 'null' },
        ];

        for (const item of items) {
            storage.setItem(item.key, item.value);

            expect(storage.getItem(item.key)).toBe(item.expected ?? item.value);
        }
    });

    test('increases length when adding new items', (): void => {
        const items: StorageItem[] = [
            { key: '$key1', value: '$value1' },
            { key: '$key2', value: '$value2' },
        ];

        for (const item of items) {
            const index: number = items.indexOf(item);

            storage.setItem(item.key, item.value);

            expect(storage.length).toBe(index + 1);
        }
    });

    test('does not increase length when updating existing item', (): void => {
        const key: string = '$key';
        const value1: string = '$value1';
        const value2: string = '$value2';

        storage.setItem(key, value1);

        const length: number = storage.length;

        storage.setItem(key, value2);

        expect(storage.length).toBe(length);
    });

    test('throws an error when storage quota is exceeded', (): void => {
        const key: string = '$key';
        const value: string = 'x'.repeat(5 * 1024 * 1024);

        expect((): void => storage.setItem(key, value)).toThrow(DOMException);

        try {
            storage.setItem(key, value);
        } catch (error) {
            expect(error).toBeInstanceOf(DOMException);
            expect(error.name).toBe('QuotaExceededError');
            expect(error.message).toContain(`Failed to execute 'setItem' on 'Storage': Setting the value of '${key}' exceeded the quota.`);
        }
    });
});

describe('LocalStorageFake.getItem', (): void => {
    test('returns null for non-existent key', (): void => {
        const key: string = '$key';

        expect(storage.getItem(key)).toBeNull();
    });

    test('returns correct value for existing key', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        storage.setItem(key, value);

        expect(storage.getItem(key)).toBe(value);
    });

    test('returns null for keys with undefined values', (): void => {
        const key: string = '$key';

        expect(storage.getItem(key)).toBeNull();
    });
});

describe('LocalStorageFake.removeItem', (): void => {
    test('removes existing item', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        storage.setItem(key, value);
        storage.removeItem(key);

        expect(storage.getItem(key)).toBeNull();
    });

    test('does not throw when removing non-existent item', (): void => {
        const key: string = '$key';

        expect((): void => storage.removeItem(key)).not.toThrow();
    });

    test('decreases length when removing item', (): void => {
        for (const item of items) {
            storage.setItem(item.key, item.value);
        }

        for (const item of items) {
            const length: number = storage.length;

            storage.removeItem(item.key);

            expect(storage.length).toBe(length - 1);
        }
    });
});

describe('LocalStorageFake.clear', (): void => {
    test('removes all items', (): void => {
        const items: StorageItem[] = [
            { key: '$key1', value: '$value1' },
            { key: '$key2', value: '$value2' },
        ];

        for (const item of items) {
            storage.setItem(item.key, item.value);
        }

        storage.clear();

        for (const item of items) {
            expect(storage.length).toBe(0);
            expect(storage.getItem(item.key)).toBeNull();
        }
    });

    test('works on empty storage', (): void => {
        expect((): void => storage.clear()).not.toThrow();

        expect(storage.length).toBe(0);
    });
});

describe('LocalStorageFake.key', (): void => {
    test('returns key at specified index', (): void => {
        for (const item of items) {
            const index: number = items.indexOf(item);

            storage.setItem(item.key, item.value);

            expect(storage.key(index)).toBe(item.key);
        }
    });

    test('returns null for out-of-bounds index', (): void => {
        const key: string = '$key';
        const value: string = '$value';

        storage.setItem(key, value);

        expect(storage.key(-1)).toBeNull();
    });

    test('returns null for empty storage', (): void => {
        expect(storage.key(0)).toBeNull();
    });
});

describe('LocalStorageFake.length', (): void => {
    test('returns correct number of items', (): void => {
        expect(storage.length).toBe(0);

        for (const item of items) {
            const length: number = storage.length;

            storage.setItem(item.key, item.value);

            expect(storage.length).toBe(length + 1);
        }

        storage.clear();

        expect(storage.length).toBe(0);
    });
});