import { LocalStorageFake } from './LocalStorageFake';

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

        try {
            this.#storage.setItem(key, JSON.stringify(item));
        } catch {
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
        const storageItem: string | null = this.#storage.getItem(key);

        if (storageItem === null) {
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

            return true;
        } else {
            return false;
        }
    }

    /**
     * Clear all keys stored in a given Storage object.
     *
     * @return { void }
     */
    static clear(): void {
        this.#storage.clear();
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
}
