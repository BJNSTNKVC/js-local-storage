export class StorageFlushing extends Event {
    /**
     * The key of the event.
     *
     * @type { string }
     */
    readonly #key: string;

    /**
     * Create a new Storage Flushing Event instance.
     */
    constructor() {
        super('local-storage:flushing');
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
