import { StorageFlushed } from '../../src/main';

describe('StorageFlushed', (): void => {
    const event: StorageFlushed = new StorageFlushed();

    test('is an instance of Event', (): void => {
        expect(event).toBeInstanceOf(Event);
    });

    test('has the correct event type', (): void => {
        expect(event.type).toBe('local-storage:flushed');
    });
});