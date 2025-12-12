import { LocalStorage, LocalStorageFake, } from '../src/main';

describe('Main', (): void => {
    test('exports LocalStorage class', (): void => {
        expect(LocalStorage).toBeDefined();
        expect(typeof LocalStorage).toBe('function');
    });

    test('exports LocalStorageFake class', (): void => {
        expect(LocalStorageFake).toBeDefined();
        expect(typeof LocalStorageFake).toBe('function');
    });

    test('exports individual modules', async (): Promise<void> => {
        const module = await import('../src/main');

        expect(module.LocalStorage).toBe(LocalStorage);
        expect(module.LocalStorageFake).toBe(LocalStorageFake);
    });
});
