"use strict";
class LocalStorage {
    /**
     * Set the default item validity period in seconds.
     *
     * @param {number | null } value
     */
    static ttl(value) {
        LocalStorage._ttl = value;
    }
    /**
     * Set the key to the Storage object.
     *
     * @param { string } key String containing the name of the key you want to create.
     * @param { * } value Value you want to give the key you are creating.
     * @param { number|null } ttl Item validity period in seconds.
     */
    static set(key, value, ttl = null) {
        ttl = ttl !== null && ttl !== void 0 ? ttl : LocalStorage._ttl;
        const item = {
            data: value,
            expiry: ttl ? Date.now() + ttl * 1000 : null
        };
        localStorage.setItem(key, JSON.stringify(item));
    }
    /**
     * Get the key from the Storage object.
     *
     * @param { string } key String containing the name of the key you want to create.
     * @param { string | null } fallback String containing the fallback value.
     *
     * @return { * }
     */
    static get(key, fallback = null) {
        const storageItem = localStorage.getItem(key);
        if (!storageItem) {
            if (fallback === null) {
                return null;
            }
            return fallback;
        }
        const item = JSON.parse(storageItem);
        if (item.expiry && Date.now() > item.expiry) {
            LocalStorage.remove(key);
            return null;
        }
        return item.data;
    }
    /**
     * Get the key from the Storage, or execute the given callback and store the result.
     *
     * @param { string } key String containing the name of the key you want to create.
     * @param { Function } callback Function you want to execute.
     * @param { number | null } ttl Item validity period in seconds.
     *
     * @return { any }
     */
    static remember(key, callback, ttl) {
        const storageItem = LocalStorage.get(key);
        if (!storageItem) {
            LocalStorage.set(key, callback(), ttl !== null && ttl !== void 0 ? ttl : LocalStorage._ttl);
        }
        return storageItem !== null && storageItem !== void 0 ? storageItem : LocalStorage.get(key);
    }
    /**
     * Retrieves all items from the Storage object.
     *
     * @return { object }
     */
    static all() {
        const storage = Object.assign({}, localStorage);
        for (const item in storage) {
            storage[item] = LocalStorage.get(item);
        }
        return storage;
    }
    /**
     * Remove the key from the Storage object.
     *
     * @param { string } key String containing the name of the key you want to delete.
     */
    static remove(key) {
        localStorage.removeItem(key);
    }
    /**
     * Clear all keys stored in a given Storage object.
     */
    static clear() {
        localStorage.clear();
    }
    /**
     * Determine if the key exists in the Storage object.
     *
     * @param { string } key String containing the name of the key you want to check against
     *
     * @return { boolean }
     */
    static has(key) {
        return !!LocalStorage.get(key);
    }
    /**
     * Determine if any of the keys exists in the Storage object.
     *
     * @param { string | array } keys String containing the name of the key you want to check against
     *
     * @return { boolean }
     */
    static hasAny(keys) {
        keys = keys instanceof Array ? keys : [...arguments];
        return keys.filter((key) => LocalStorage.has(key)).length > 0;
    }
    /**
     * Determine if the Storage object is empty.
     *
     * @return { boolean }
     */
    static isEmpty() {
        return localStorage.length === 0;
    }
    /**
     * Determine if the Storage object is not empty.
     *
     * @return { boolean }
     */
    static isNotEmpty() {
        return !LocalStorage.isEmpty();
    }
    /**
     * Retrieves all keys from the Storage object.
     *
     * @return { array }
     */
    static keys() {
        return Object.keys(localStorage);
    }
    /**
     * Returns the total number of items in the Storage object.
     *
     * @return { number }
     */
    static count() {
        return localStorage.length;
    }
    /**
     * Updates the item expiration time.
     *
     * @param { string } key String containing the name of the key you want to update.
     * @param { number | null } ttl Item validity period in seconds.
     */
    static touch(key, ttl = null) {
        const item = LocalStorage.get(key);
        if (!item) {
            return;
        }
        LocalStorage.set(key, item, ttl !== null && ttl !== void 0 ? ttl : LocalStorage._ttl);
    }
    /**
     * Dump the key from the Storage object.
     *
     * @param { string } key String containing the name of the key you want to dump.
     */
    static dump(key) {
        console.log(LocalStorage.get(key));
    }
}
/**
 * Default item validity period in seconds.
 *
 * @type { number | null }
 */
Object.defineProperty(LocalStorage, "_ttl", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: null
});
;
if (typeof exports != 'undefined') {
    module.exports.LocalStorage = LocalStorage;
}
//# sourceMappingURL=main.js.map