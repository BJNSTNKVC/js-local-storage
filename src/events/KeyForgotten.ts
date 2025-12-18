export class KeyForgotten extends Event {
    /**
     * The key of the event.
     *
     * @type { string }
     */
    readonly #key: string;

    /**
     * Create a new Key Forgotten Event instance.
     *
     * @param { string } key
     */
    constructor(key: string) {
        super('local-storage:forgot');

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
