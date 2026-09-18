export class StorageFlushed extends Event {
    /**
     * Create a new Storage Flushed Event instance.
     */
    constructor() {
        super('local-storage:flushed');
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
