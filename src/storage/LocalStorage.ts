import { LocalStorageFake } from './LocalStorageFake';
import {
    KeyForgotFailed,
    KeyForgotten,
    KeyHit,
    KeyMissed,
    KeyWriteFailed,
    KeyWritten,
    type LocalStorageEvent,
    type LocalStorageEventListener,
    type LocalStorageEvents,
    RetrievingKey,
    StorageFlushed,
    StorageFlushing,
    WritingKey,
} from '../events';

export type LocalStorageItem = {
    data: any,
    expiry: number | null
};

export class LocalStorage {
    /**
     * Current Storage instance.
     *
     * @type { Storage }
     */
    static #storage: Storage = localStorage;

    /**
     * Item validity period in seconds.
     *
     * @type { number | null }
     */
    static #ttl: number | null = null;

    /**
     * Set the default item validity period in seconds.
     *
     * @param { number | null } value
     *
     * @return { void }
     */
    static ttl(value: number | null): void {
        this.#ttl = value;
    }

    /**
     * Set the key to the Storage object.
     *
     * @param { string } key
     * @param { * } value
     * @param { number | null } ttl
     *
     * @return { boolean }
     */
    static set(key: string, value: any, ttl: number | null = null): boolean {
        ttl = ttl ?? this.#ttl;

        const item: LocalStorageItem = {
            data  : typeof value === 'function' ? value() : value,
            expiry: ttl ? Date.now() + ttl * 1000 : null
        };

        this.emit(new WritingKey(key, item.data, item.expiry));

        try {
            this.#storage.setItem(key, JSON.stringify(item));

            this.emit(new KeyWritten(key, item.data, item.expiry));
        } catch {
            this.emit(new KeyWriteFailed(key, item.data, item.expiry));

            return false;
        }

        return true;
    }

    /**
     * Get the key from the Storage object.
     *
     * @param { string } key
     * @param { string | Function | null } fallback
     *
     * @return { * }
     */
    static get(key: string, fallback: string | Function | null = null): any {
        this.emit(new RetrievingKey(key));

        const storageItem: string | null = this.#storage.getItem(key);

        if (storageItem === null) {
            this.emit(new KeyMissed(key));

            return typeof fallback === 'function' ? fallback() : fallback;
        }

        let value: any;

        try {
            const item: LocalStorageItem = JSON.parse(storageItem);

            if (item.expiry && Date.now() > item.expiry) {
                this.remove(key);

                return null;
            }

            value = item.data ?? item;
        } catch {
            value = storageItem;
        }

        this.emit(new KeyHit(key, value));

        return value;
    }

    /**
     * Get the key from the Storage, or execute the given callback and store the result.
     *
     * @param { string } key
     * @param { Function } callback
     * @param { number | null } ttl
     *
     * @return { any }
     */
    static remember(key: string, callback: Function, ttl: number | null = null): any {
        const item: string | null = this.get(key);

        if (item === null) {
            this.set(key, callback, ttl ?? this.#ttl);
        }

        return item ?? this.get(key);
    }

    /**
     * Retrieves all items from the Storage object.
     *
     * @return { { key: string, value: any }[] }
     */
    static all(): { key: string, value: any }[] {
        return this.keys().map((key: string): { key: string, value: any } => {
            return { key, value: this.get(key) };
        });
    }

    /**
     * Remove the key from the Storage object.
     *
     * @param { string } key
     *
     * @return { boolean }
     */
    static remove(key: string): boolean {
        if (this.has(key)) {
            this.#storage.removeItem(key);

            this.emit(new KeyForgotten(key));

            return true;
        } else {
            this.emit(new KeyForgotFailed(key));

            return false;
        }
    }

    /**
     * Clear all keys stored in a given Storage object.
     *
     * @return { void }
     */
    static clear(): void {
        this.emit(new StorageFlushing());

        this.#storage.clear();

        this.emit(new StorageFlushed());
    }

    /**
     * Determine if the key exists in the Storage object.
     *
     * @param { string } key
     *
     * @return { boolean }
     */
    static has(key: string): boolean {
        return !!this.get(key);
    }

    /**
     * Determine if the key does not exist in the Storage object.
     *
     * @param { string } key
     *
     * @return { boolean }
     */
    static missing(key: string): boolean {
        return !this.has(key);
    }

    /**
     * Determine if any of the keys exists in the Storage object.
     *
     * @param { string | string[] } keys
     *
     * @return { boolean }
     */
    static hasAny(...keys: [string | string[]] | string[]): boolean {
        if (keys.length === 1) {
            if (Array.isArray(keys[0])) {
                keys = keys[0];
            } else {
                keys = [keys[0]];
            }
        }

        return keys.some((key: string): boolean => this.has(key));
    }

    /**
     * Determine if the Storage object is empty.
     *
     * @return { boolean }
     */
    static isEmpty(): boolean {
        return this.#storage.length === 0;
    }

    /**
     * Determine if the Storage object is not empty.
     *
     * @return { boolean }
     */
    static isNotEmpty(): boolean {
        return !this.isEmpty();
    }

    /**
     * Retrieves all keys from the Storage object.
     *
     * @return { string[] }
     */
    static keys(): string[] {
        return Object.keys(this.#storage);
    }

    /**
     * Returns the total number of items in the Storage object.
     *
     * @return { number }
     */
    static count(): number {
        return this.#storage.length;
    }

    /**
     * Updates the item expiration time.
     *
     * @param { string } key
     * @param { number | null } ttl
     *
     * @return { boolean }
     */
    static touch(key: string, ttl: number | null = null): boolean {
        const item: any = this.get(key);

        if (item === null) {
            return false;
        }

        return this.set(key, item, ttl ?? this.#ttl);
    }

    /**
     * Returns the expiration date for a given key.
     *
     * @param { string } key
     *
     * @return { Date | null }
     */
    static expiry(key: string): Date | null {
        const storageItem: string | null = this.#storage.getItem(key);

        if (storageItem === null) {
            return null;
        }

        try {
            const item: LocalStorageItem | null = JSON.parse(storageItem);

            if (item === null || item.expiry === undefined || item.expiry === null) {
                return null;
            }

            return new Date(item.expiry);
        } catch {
            return null;
        }
    }

    /**
     * Dump the key from the Storage object.
     *
     * @param { string } key
     */
    static dump(key: string): void {
        console.log(this.get(key));
    }

    /**
     * Replace the Local Storage instance with a fake.
     *
     * @return { void }
     */
    static fake(): void {
        this.#storage = new LocalStorageFake();
    }

    /**
     * Restore the Local Storage instance.
     *
     * @return { void }
     */
    static restore(): void {
        this.#storage = localStorage;
    }

    /**
     * Determines whether a "fake" has been set as the Local Storage instance.
     *
     * @return { boolean }
     */
    static isFake(): boolean {
        return this.#storage instanceof LocalStorageFake;
    }

    /**
     * Register an event listener.
     *
     * @template { keyof LocalStorageEvents } K
     *
     * @param { K | LocalStorageEvents } events
     * @param { LocalStorageEventListener<K> | null } listener
     *
     * @return { void }
     */
    static listen(events: 'retrieving', listener: (event: RetrievingKey) => void): void;
    static listen(events: 'hit', listener: (event: KeyHit) => void): void;
    static listen(events: 'missed', listener: (event: KeyMissed) => void): void;
    static listen(events: 'writing', listener: (event: WritingKey) => void): void;
    static listen(events: 'written', listener: (event: KeyWritten) => void): void;
    static listen(events: 'write-failed', listener: (event: KeyWriteFailed) => void): void;
    static listen(events: 'forgot', listener: (event: KeyForgotten) => void): void;
    static listen(events: 'forgot-failed', listener: (event: KeyForgotFailed) => void): void;
    static listen(events: 'flushing', listener: (event: StorageFlushing) => void): void;
    static listen(events: 'flushed', listener: (event: StorageFlushed) => void): void;
    static listen(events: LocalStorageEvents): void;
    static listen<K extends keyof LocalStorageEvent>(events: keyof LocalStorageEvent, listener: LocalStorageEventListener<K>): void;
    static listen<K extends keyof LocalStorageEvent>(events: keyof LocalStorageEvent | LocalStorageEvents, listener: LocalStorageEventListener<K> | null = null): void {
        events = typeof events === 'string' ? { [events]: listener } : events;

        for (const [event, listener] of Object.entries(events)) {
            addEventListener(`local-storage:${event}`, listener as EventListener, { once: true });
        }
    }

    /**
     * Register a listener on "retrieving" event.
     *
     * @param { (event: RetrievingKey) => void } listener
     *
     * @return { void }
     */
    static onRetrieving(listener: (event: RetrievingKey) => void): void {
        this.listen('retrieving', listener);
    }

    /**
     * Register a listener on "hit" event.
     *
     * @param { (event: KeyHit) => void } listener
     *
     * @return { void }
     */
    static onHit(listener: (event: KeyHit) => void): void {
        this.listen('hit', listener);
    }

    /**
     * Register a listener on "missed" event.
     *
     * @param { (event: KeyMissed) => void } listener
     *
     * @return { void }
     */
    static onMissed(listener: (event: KeyMissed) => void): void {
        this.listen('missed', listener);
    }

    /**
     * Register a listener on "writing" event.
     *
     * @param { (event: WritingKey) => void } listener
     *
     * @return { void }
     */
    static onWriting(listener: (event: WritingKey) => void): void {
        this.listen('writing', listener);
    }

    /**
     * Register a listener on "written" event.
     *
     * @param { (event: KeyWritten) => void } listener
     *
     * @return { void }
     */
    static onWritten(listener: (event: KeyWritten) => void): void {
        this.listen('written', listener);
    }

    /**
     * Register a listener on "failed" event.
     *
     * @param { (event: KeyWriteFailed) => void } listener
     *
     * @return { void }
     */
    static onWriteFailed(listener: (event: KeyWriteFailed) => void): void {
        this.listen('write-failed', listener);
    }

    /**
     * Register a listener on "forgot" event.
     *
     * @param { (event: KeyForgotten) => void } listener
     *
     * @return { void }
     */
    static onForgot(listener: (event: KeyForgotten) => void): void {
        this.listen('forgot', listener);
    }

    /**
     * Register a listener on "forgot-failed" event.
     *
     * @param { (event: KeyForgotFailed) => void } listener
     *
     * @return { void }
     */
    static onForgotFailed(listener: (event: KeyForgotFailed) => void): void {
        this.listen('forgot-failed', listener);
    }

    /**
     * Register a listener on "flushing" event.
     *
     * @param { (event: StorageFlushing) => void } listener
     *
     * @return { void }
     */
    static onFlushing(listener: (event: StorageFlushing) => void): void {
        this.listen('flushing', listener);
    }

    /**
     * Register a listener on "flushed" event.
     *
     * @param { (event: StorageFlushed) => void } listener
     *
     * @return { void }
     */
    static onFlushed(listener: (event: StorageFlushed) => void): void {
        this.listen('flushed', listener);
    }

    /**
     * Emit an event for the Local Storage instance.
     *
     * @template { keyof LocalStorageEvents } K
     *
     * @param { LocalStorageEvent[K] } event
     *
     * @returns { void }
     */
    private static emit<K extends keyof LocalStorageEvent>(event: LocalStorageEvent[K]): void {
        dispatchEvent(event);
    }
}
