import { WritingKey } from '../../src/main';

describe('WritingKey', (): void => {
    const key: string = '$key';
    const value: string = '$value';
    const expiry: number | null = 3600;
    const event: WritingKey = new WritingKey(key, value, expiry);

    test('is an instance of Event', (): void => {
        expect(event).toBeInstanceOf(Event);
    });

    test('has the correct event type', (): void => {
        expect(event.type).toBe('local-storage:writing');
    });

    test('contains the key that is being written', (): void => {
        expect(event.key).toBe(key);
    });

    test('contains the value that is being written', (): void => {
        expect(event.value).toBe(value);
    });

    test('contains the expiry value', (): void => {
        expect(event.expiry).toBe(expiry);
    });

    test('handles null expiry correctly', (): void => {
        const event: WritingKey = new WritingKey(key, value, null);

        expect(event.expiry).toBeNull();
    });

    test('handles different value types correctly', (): void => {
        const values: any[] = ['string', 123, true, { key: 'value' }, [1, 2, 3], null, undefined];

        values.forEach((value: any) => {
            const event: WritingKey = new WritingKey(key, value);

            expect(event.value).toBe(value);
        });
    });
});