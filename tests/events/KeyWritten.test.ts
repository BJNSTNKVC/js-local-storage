import { KeyWritten } from '../../src/main';

describe('KeyWritten', (): void => {
    const key: string = '$key';
    const value: string = '$value';
    const expiry: number | null = 3600;
    const event: KeyWritten = new KeyWritten(key, value, expiry);

    test('is an instance of Event', (): void => {
        expect(event).toBeInstanceOf(Event);
    });

    test('has the correct event type', (): void => {
        expect(event.type).toBe('local-storage:written');
    });

    test('contains the key that was written', (): void => {
        expect(event.key).toBe(key);
    });

    test('contains the value that was written', (): void => {
        expect(event.value).toBe(value);
    });

    test('contains the expiry value', (): void => {
        expect(event.expiry).toBe(expiry);
    });

    test('handles null expiry correctly', (): void => {
        const event: KeyWritten = new KeyWritten(key, value, null);

        expect(event.expiry).toBeNull();
    });

    test('handles different value types correctly', (): void => {
        const values: any[] = ['string', 123, true, { key: 'value' }, [1, 2, 3], null, undefined];

        values.forEach((value: any) => {
            const event: KeyWritten = new KeyWritten(key, value);

            expect(event.value).toBe(value);
        });
    });
});