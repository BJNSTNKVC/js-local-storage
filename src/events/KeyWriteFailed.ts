export class KeyWriteFailed extends Event {
    /**
     * The key of the event.
     *
     * @type { string }
     */
    readonly #key: string;

    /**
     * The value of the key.
     *
     * @type { string }
     */
    readonly #value: string;

    /**
     * The validity period in seconds since Unix Epoch.
     *
     * @type { number | number }
     */
    readonly #expiry: number | null;

    /**
     * Create a new Key Write Failed Event instance.
     *
     * @param { string } key
     * @param { string } value
     * @param { number | null } expiry
     */
    constructor(key: string, value: any, expiry: number | null = null) {
        super('local-storage:write-failed');

        this.#key = key;
        this.#value = value;
        this.#expiry = expiry;
    }

    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key(): string {
        return this.#key;
    }

    /**
     * Get the value of the key.
     *
     * @return { * }
     */
    get value(): any {
        return this.#value;
    }

    /**
     * Get the validity period in milliseconds since Unix Epoch.
     *
     * @return { number | null }
     */
    get expiry(): number | null {
        return this.#expiry;
    }
}
