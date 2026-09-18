export class StorageFlushing extends Event {
    /**
     * Create a new Storage Flushing Event instance.
     */
    constructor() {
        super('local-storage:flushing');
    }

    /**
     * Get the key of the event.
     *
     * @return { undefined }
     */
    get key(): undefined {
        return undefined;
    }
}
