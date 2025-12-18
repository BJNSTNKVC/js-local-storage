export class RetrievingKey extends Event {
    /**
     * The key of the event.
     *
     * @type { string }
     */
    readonly #key: string;

    /**
     * Create a new Retrieving Key Event instance.
     *
     * @param { string } key
     */
    constructor(key: string) {
        super('local-storage:retrieving');

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
