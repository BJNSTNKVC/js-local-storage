export class LocalStorageFake implements Storage {
    /**
     * Current used storage in bytes.
     *
     * @type { number }
     */
    #used: number = 0;

    /**
     * Maximum storage quota (5MB for most modern browsers).
     *
     * @type { number }
     */
    #quota: number = 5 * 1024 * 1024;

    /**
     * Storage property.
     *
     * @type { string }
     */
    [key: string]: any;

    /**
     * Create a new Storage instance.
     */
    constructor() {
        this.#used = this.space();
    }

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
        const value: string = String(keyValue);

        if (this.exceeded(keyName, value)) {
            this.throw(keyName);
        }

        this[keyName] = value;

        this.#used = this.space();
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

        this.#used = this.space();
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

        this.#used = this.space();
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

    /**
     * Calculate current used storage space in bytes.
     *
     * @return { number }
     */
    private space(): number {
        this.#used = 0;

        for (const key of Object.keys(this)) {
            this.#used += this.size(key, this[key]);
        }

        return this.#used;
    }

    /**
     * Calculate the size a new item would take in bytes.
     *
     * @param { string } keyName
     * @param { string } keyValue
     *
     * @return { number }
     */
    private size(keyName: string, keyValue: string): number {
        return new Blob([keyName, keyValue]).size;
    }

    /**
     * Determine if the Storage quota is exceeded.
     *
     * @param { string } keyName
     * @param { string } keyValue
     *
     * @return { boolean }
     */
    private exceeded(keyName: string, keyValue: string): boolean {
        return this.size(keyName, keyValue) + this.#used > this.#quota;
    }

    /**
     * Throws an error in case the Storage quota is exceeded.
     *
     * @param { string } keyName
     *
     * @return { void }
     */
    private throw(keyName: string): void {
        throw new DOMException(`Failed to execute 'setItem' on 'Storage': Setting the value of '${keyName}' exceeded the quota.`, 'QuotaExceededError');
    }
}