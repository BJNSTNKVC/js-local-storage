import { RetrievingKey } from '../../src/main';

describe('RetrievingKey', (): void => {
    const key: string = '$key';
    const event: RetrievingKey = new RetrievingKey(key);

    test('is an instance of Event', (): void => {
        expect(event).toBeInstanceOf(Event);
    });

    test('has the correct event type', (): void => {
        expect(event.type).toBe('local-storage:retrieving');
    });

    test('contains the key that is being retrieved', (): void => {
        expect(event.key).toBe(key);
    });
});