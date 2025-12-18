import { KeyHit } from '../../src/main';

describe('KeyHit', (): void => {
    const key: string = '$key';
    const value: string = '$value';
    const event: KeyHit = new KeyHit(key, value);


    test('is an instance of Event', (): void => {
        expect(event).toBeInstanceOf(Event);
    });

    test('has the correct event type', (): void => {
        expect(event.type).toBe('local-storage:hit');
    });

    test('contains the key that was hit', (): void => {
        expect(event.key).toBe(key);
    });

    test('contains the value of the key that was hit', (): void => {
        expect(event.value).toBe(value);
    });

    test('handles different value types correctly', (): void => {
        const values: any[] = ['string', 123, true, { key: 'value' }, [1, 2, 3], null, undefined];

        values.forEach((value: any) => {
            const event: KeyHit = new KeyHit(key, value);

            expect(event.value).toBe(value);
        });
    });
});