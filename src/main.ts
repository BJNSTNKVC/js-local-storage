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
     * Default item validity period in seconds.
     *
     * @type { number | null }
     */
    static #ttl: number | null = null;

    /**
     * Set the default item validity period in seconds.
     *
     * @param { number | null } value
     */
    static ttl(value: number | null): void {
        this.#ttl = value;
    }

    /**
     * Set the key to the Storage object.
     *
     * @param { string } key String containing the name of the key you want to create.
     * @param { * } value Value you want to give the key you are creating.
     * @param { number | null } ttl Item validity period in seconds.
     */
    static set(key: string, value: any, ttl: number | null = null): void {
        ttl = ttl ?? this.#ttl;

        const item: LocalStorageItem = {
            data  : typeof value === 'function' ? value() : value,
            expiry: ttl ? Date.now() + ttl * 1000 : null
        };

        this.#storage.setItem(key, JSON.stringify(item));
    }

    /**
     * Get the key from the Storage object.
     *
     * @param { string } key String containing the name of the key you want to create.
     * @param { string | Function | null } fallback Fallback value in case the key does not exist.
     *
     * @return { * }
     */
    static get(key: string, fallback: string | Function | null = null): any {
        const storageItem: string | null = this.#storage.getItem(key);

        if (storageItem === null) {
            return typeof fallback === 'function' ? fallback() : fallback;
        }

        try {
            const item: LocalStorageItem = JSON.parse(storageItem);

            if (item.expiry && Date.now() > item.expiry) {
                this.remove(key);

                return null;
            }

            return item.data ?? item;
        } catch {
            return storageItem;
        }
    }

    /**
     * Get the key from the Storage, or execute the given callback and store the result.
     *
     * @param { string } key String containing the name of the key you want to create.
     * @param { Function } callback Function you want to execute.
     * @param { number | null } ttl Item validity period in seconds.
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
     * @param { string } key String containing the name of the key you want to delete.
     */
    static remove(key: string): void {
        this.#storage.removeItem(key);
    }

    /**
     * Clear all keys stored in a given Storage object.
     */
    static clear(): void {
        this.#storage.clear();
    }

    /**
     * Determine if the key exists in the Storage object.
     *
     * @param { string } key String containing the name of the key you want to check against
     *
     * @return { boolean }
     */
    static has(key: string): boolean {
        return !!this.get(key);
    }

    /**
     * Determine if any of the keys exists in the Storage object.
     *
     * @param { string | string[] } keys String containing the name of the key you want to check against
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
     * @param { string } key String containing the name of the key you want to update.
     * @param { number | null } ttl Item validity period in seconds.
     */
    static touch(key: string, ttl: number | null = null): void {
        const item: any = this.get(key);

        if (item === null) {
            return;
        }

        this.set(key, item, ttl ?? this.#ttl);
    }

    /**
     * Returns the expiration date for a given key.
     *
     * @param { string } key String containing the name of the key you want to check against
     * @param { boolean } asDate If true, returns the expiration date as a Date object.
     *
     * @return { number | Date | null }
     */
    static expiry(key: string, asDate: boolean = false): number | Date | null {
        const storageItem: string | null = this.#storage.getItem(key);

        if (storageItem === null) {
            return null;
        }

        try {
            const item: LocalStorageItem | null = JSON.parse(storageItem);

            if (item?.expiry === undefined || item?.expiry === null) {
                return null;
            }

            return asDate ? new Date(item.expiry) : item.expiry;
        } catch {
            return null;
        }
    }

    /**
     * Dump the key from the Storage object.
     *
     * @param { string } key String containing the name of the key you want to dump.
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

export class LocalStorageFake implements Storage {
    /**
     * Storage property.
     *
     * @type { string }
     */
    [key: string]: any;

    /**
     * Returns an integer representing the number of data items stored in the Storage object.
     *
     * @return { number }
     */
    get length(): number {
        return Object.keys(this).length;
    }

    /**
     * When passed a key name, will return that key's value.
     *
     * @param { string } keyName
     *
     * @return { any }
     */
    getItem(keyName: string): string {
        return this[keyName] || null;
    }

    /**
     * When passed a key name and value, will add that key to the storage, or update that key's value if it already exists.
     *
     * @param { string } keyName
     * @param { string } keyValue
     *
     * @return { void }
     */
    setItem(keyName: string, keyValue: string): void {
        this[keyName] = keyValue;
    }

    /**
     * When passed a key name, will remove that key from the storage.
     *
     * @param { string } keyName
     *
     * @return { void }
     */
    removeItem(keyName: string): void {
        delete this[keyName];
    }

    /**
     * When invoked, will empty all keys out of the storage.
     *
     * @return { void }
     */
    clear(): void {
        for (const key of Object.keys(this)) {
            delete this[key];
        }
    }

    /**
     * When passed a number n, returns the name of the nth key in a given Storage object.
     *
     * @param { number } index
     *
     * @return { string | null }
     */
    key(index: number): string | null {
        return Object.keys(this)[index] ?? null;
    }
}

if (typeof window !== 'undefined') {
    (window as any).LocalStorage = LocalStorage;
    (window as any).LocalStorageFake = LocalStorageFake;
}

if (typeof global !== 'undefined') {
    (global as any).LocalStorage = LocalStorage;
    (global as any).LocalStorageFake = LocalStorageFake;
}