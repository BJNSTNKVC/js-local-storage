import { StorageFlushing } from '../../src/main';

describe('StorageFlushing', (): void => {
    const event: StorageFlushing = new StorageFlushing();

    test('is an instance of Event', (): void => {
        expect(event).toBeInstanceOf(Event);
    });

    test('has the correct event type', (): void => {
        expect(event.type).toBe('local-storage:flushing');
    });
});