export type LocalStorageItem = {
    data: any,
    expiry: number | null
};

export class LocalStorage {
    static ttl(value: number | null): void;
    static set(key: string, value: any, ttl?: number | null): void;
    static get(key: string, fallback?: string | Function | null): any;
    static remember(key: string, callback: Function, ttl?: number | null): any;
    static all(): object;
    static remove(key: string): void;
    static clear(): void;
    static has(key: string): boolean;
    static hasAny(keys: string | string[]): boolean;
    static isEmpty(): boolean;
    static isNotEmpty(): boolean;
    static keys(): string[];
    static count(): number;
    static touch(key: string, ttl?: number | null): void;
    static expiry(key: string, asDate?: boolean): number | Date | null;
    static dump(key: string): void;
}