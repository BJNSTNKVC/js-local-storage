import {
    KeyForgotFailed,
    KeyForgotten,
    KeyHit,
    KeyMissed,
    KeyWriteFailed,
    KeyWritten,
    LocalStorage,
    LocalStorageFake,
    RetrievingKey,
    StorageFlushed,
    StorageFlushing,
    WritingKey
} from '../src/main';

describe('Main', (): void => {
    test('exports LocalStorage class', (): void => {
        expect(LocalStorage).toBeDefined();
        expect(typeof LocalStorage).toBe('function');
    });

    test('exports LocalStorageFake class', (): void => {
        expect(LocalStorageFake).toBeDefined();
        expect(typeof LocalStorageFake).toBe('function');
    });

    test('exports RetrievingKey class', (): void => {
        expect(RetrievingKey).toBeDefined();
        expect(typeof RetrievingKey).toBe('function');
    });

    test('exports KeyMissed class', (): void => {
        expect(KeyMissed).toBeDefined();
        expect(typeof KeyMissed).toBe('function');
    });

    test('exports KeyHit class', (): void => {
        expect(KeyHit).toBeDefined();
        expect(typeof KeyHit).toBe('function');
    });

    test('exports WritingKey class', (): void => {
        expect(WritingKey).toBeDefined();
        expect(typeof WritingKey).toBe('function');
    });

    test('exports KeyWritten class', (): void => {
        expect(KeyWritten).toBeDefined();
        expect(typeof KeyWritten).toBe('function');
    });

    test('exports KeyWriteFailed class', (): void => {
        expect(KeyWriteFailed).toBeDefined();
        expect(typeof KeyWriteFailed).toBe('function');
    });

    test('exports KeyForgotten class', (): void => {
        expect(KeyForgotten).toBeDefined();
        expect(typeof KeyForgotten).toBe('function');
    });

    test('exports KeyForgotFailed class', (): void => {
        expect(KeyForgotFailed).toBeDefined();
        expect(typeof KeyForgotFailed).toBe('function');
    });

    test('exports StorageFlushing class', (): void => {
        expect(StorageFlushing).toBeDefined();
        expect(typeof StorageFlushing).toBe('function');
    });

    test('exports StorageFlushed class', (): void => {
        expect(StorageFlushed).toBeDefined();
        expect(typeof StorageFlushed).toBe('function');
    });

    test('exports individual modules', async (): Promise<void> => {
        const module = await import('../src/main');

        expect(module.LocalStorage).toBe(LocalStorage);
        expect(module.LocalStorageFake).toBe(LocalStorageFake);
        expect(module.RetrievingKey).toBe(RetrievingKey);
        expect(module.KeyMissed).toBe(KeyMissed);
        expect(module.KeyHit).toBe(KeyHit);
        expect(module.WritingKey).toBe(WritingKey);
        expect(module.KeyWritten).toBe(KeyWritten);
        expect(module.KeyWriteFailed).toBe(KeyWriteFailed);
        expect(module.KeyForgotten).toBe(KeyForgotten);
        expect(module.KeyForgotFailed).toBe(KeyForgotFailed);
        expect(module.StorageFlushing).toBe(StorageFlushing);
        expect(module.StorageFlushed).toBe(StorageFlushed);
    });
});
