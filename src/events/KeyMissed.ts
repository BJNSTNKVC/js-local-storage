export class KeyMissed extends Event {
    /**
     * The key of the event.
     *
     * @type { string }
     */
    readonly #key: string;

    /**
     * Create a new Key Missed Event instance.
     *
     * @param { string } key
     */
    constructor(key: string) {
        super('local-storage:missed');

        this.#key = key;
    }

    /**
     * Get the key of the event.
     *
     * @return { string }
     */
    get key(): string {
        return this.#key;
    }
}
