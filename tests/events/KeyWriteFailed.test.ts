import { KeyWriteFailed } from '../../src/main';

describe('KeyWriteFailed', (): void => {
    const key: string = '$key';
    const value: string = '$value';
    const expiry: number | null = 3600;
    const event: KeyWriteFailed = new KeyWriteFailed(key, value, expiry);

    test('is an instance of Event', (): void => {
        expect(event).toBeInstanceOf(Event);
    });

    test('has the correct event type', (): void => {
        expect(event.type).toBe('local-storage:write-failed');
    });

    test('contains the key that failed to be written', (): void => {
        expect(event.key).toBe(key);
    });

    test('contains the value that failed to be written', (): void => {
        expect(event.value).toBe(value);
    });

    test('contains the expiry value', (): void => {
        expect(event.expiry).toBe(expiry);
    });

    test('handles null expiry correctly', (): void => {
        const event: KeyWriteFailed = new KeyWriteFailed(key, value, null);

        expect(event.expiry).toBeNull();
    });

    test('handles different value types correctly', (): void => {
        const values: any[] = ['string', 123, true, { key: 'value' }, [1, 2, 3], null, undefined];

        values.forEach((value: any) => {
            const event: KeyWriteFailed = new KeyWriteFailed(key, value);

            expect(event.value).toBe(value);
        });
    });
});