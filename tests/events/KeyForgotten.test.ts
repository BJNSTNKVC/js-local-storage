import { KeyForgotten } from '../../src/main';

describe('KeyForgotten', (): void => {
    const key: string = '$key';
    const event: KeyForgotten = new KeyForgotten(key);

    test('is an instance of Event', (): void => {
        expect(event).toBeInstanceOf(Event);
    });

    test('has the correct event type', (): void => {
        expect(event.type).toBe('local-storage:forgot');
    });

    test('contains the key that was forgotten', (): void => {
        expect(event.key).toBe(key);
    });
});