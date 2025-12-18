import { KeyForgotFailed } from '../../src/main';

describe('KeyForgotFailed', (): void => {
    const key: string = '$key';
    const event: KeyForgotFailed = new KeyForgotFailed(key);

    test('is an instance of Event', (): void => {
        expect(event).toBeInstanceOf(Event);
    });

    test('has the correct event type', (): void => {
        expect(event.type).toBe('local-storage:forgot-failed');
    });

    test('contains the key that failed to be forgotten', (): void => {
        expect(event.key).toBe(key);
    });
});