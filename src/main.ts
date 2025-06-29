export type LocalStorageItem = {
    data: any,
    expiry: number | null
};

export class LocalStorage {
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
    static ttl(value: number | null) {
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
            data  : value instanceof Function ? value() : value,
            expiry: ttl ? Date.now() + ttl * 1000 : null
        };

        localStorage.setItem(key, JSON.stringify(item));
    }

    /**
     * Get the key from the Storage object.
     *
     * @param { string } key String containing the name of the key you want to create.
     * @param { string | Function | null } fallback String containing the fallback value.
     *
     * @return { * }
     */
    static get(key: string, fallback: string | Function | null = null): any {
        const storageItem: string | null = localStorage.getItem(key);

        if (storageItem === null) {
            return fallback instanceof Function ? fallback() : fallback ?? null;
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
     * @return { object }
     */
    static all(): Record<string, any> {
        return Object.fromEntries(Object.keys(localStorage).map((key: string): [string, any] => [key, this.get(key)]));
    }

    /**
     * Remove the key from the Storage object.
     *
     * @param { string } key String containing the name of the key you want to delete.
     */
    static remove(key: string): void {
        localStorage.removeItem(key);
    }

    /**
     * Clear all keys stored in a given Storage object.
     */
    static clear(): void {
        localStorage.clear();
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
     * @param { string | array } keys String containing the name of the key you want to check against
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
        return Object.keys(this.all()).length === 0;
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
     * @return { array }
     */
    static keys(): string[] {
        return Object.keys(localStorage);
    }

    /**
     * Returns the total number of items in the Storage object.
     *
     * @return { number }
     */
    static count(): number {
        return localStorage.length;
    }

    /**
     * Updates the item expiration time.
     *
     * @param { string } key String containing the name of the key you want to update.
     * @param { number | null } ttl Item validity period in seconds.
     */
    static touch(key: string, ttl: number | null = null): void {
        const item = this.get(key);

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
        const storageItem: string | null = localStorage.getItem(key);

        if (storageItem === null) {
            return null;
        }

        try {
            const item: LocalStorageItem | null = JSON.parse(storageItem);

            if (!item?.hasOwnProperty('expiry') || item?.expiry === null) {
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
}

if (typeof window !== 'undefined') {
    (window as any).LocalStorage = LocalStorage;
}

if (typeof global !== 'undefined') {
    (global as any).LocalStorage = LocalStorage;
}