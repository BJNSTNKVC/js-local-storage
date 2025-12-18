export class KeyHit extends Event {
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
     * Create a new Key Hit Event instance.
     *
     * @param { string } key
     * @param { string } value
     */
    constructor(key: string, value: any) {
        super('local-storage:hit');

        this.#key = key;
        this.#value = value;
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
}
