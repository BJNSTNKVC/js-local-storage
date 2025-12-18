import { KeyMissed } from '../../src/main';

describe('KeyMissed', (): void => {
    const key: string = '$key';
    const event: KeyMissed = new KeyMissed(key);

    test('is an instance of Event', (): void => {
        expect(event).toBeInstanceOf(Event);
    });

    test('has the correct event type', (): void => {
        expect(event.type).toBe('local-storage:missed');
    });

    test('contains the key that was missed', (): void => {
        expect(event.key).toBe(key);
    });
});