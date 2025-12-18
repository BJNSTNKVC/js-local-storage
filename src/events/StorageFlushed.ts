export class StorageFlushed extends Event {
    /**
     * The key of the event.
     *
     * @type { string }
     */
    readonly #key: string;

    /**
     * Create a new Storage Flushed Event instance.
     */
    constructor() {
        super('local-storage:flushed');
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
