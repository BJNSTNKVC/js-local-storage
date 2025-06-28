(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.LocalStorage = {}));
})(this, (function (exports) { 'use strict';

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
                data: value instanceof Function ? value() : value,
                expiry: ttl ? Date.now() + ttl * 1000 : null
            };
            localStorage.setItem(key, JSON.stringify(item));
        }
        /**
         * Get the key from the Storage object.
         *
         * @param { string } key String containing the name of the key you want to create.
         * @param { string | Function | null } fallback String containing the fallback value.
         *
         * @return { * }
         */
        static get(key, fallback = null) {
            var _a;
            const storageItem = localStorage.getItem(key);
            if (storageItem === null) {
                return fallback instanceof Function ? fallback() : fallback !== null && fallback !== void 0 ? fallback : null;
            }
            try {
                const item = JSON.parse(storageItem);
                if (item.expiry && Date.now() > item.expiry) {
                    LocalStorage.remove(key);
                    return null;
                }
                return (_a = item.data) !== null && _a !== void 0 ? _a : item;
            }
            catch (error) {
                return storageItem;
            }
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
        static remember(key, callback, ttl = null) {
            const item = LocalStorage.get(key);
            if (item === null) {
                LocalStorage.set(key, callback, ttl !== null && ttl !== void 0 ? ttl : LocalStorage._ttl);
            }
            return item !== null && item !== void 0 ? item : LocalStorage.get(key);
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
            return Object.keys(LocalStorage.all()).length === 0;
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
            if (item === null) {
                return;
            }
            LocalStorage.set(key, item, ttl !== null && ttl !== void 0 ? ttl : LocalStorage._ttl);
        }
        /**
         * Returns the expiration date for a given key.
         *
         * @param { string } key String containing the name of the key you want to check against
         * @param { boolean } asDate If true, returns the expiration date as a Date object.
         *
         * @return { number | Date | null }
         */
        static expiry(key, asDate = false) {
            const storageItem = localStorage.getItem(key);
            if (storageItem === null) {
                return null;
            }
            try {
                const item = JSON.parse(storageItem);
                if (!(item === null || item === void 0 ? void 0 : item.hasOwnProperty('expiry')) || (item === null || item === void 0 ? void 0 : item.expiry) === null) {
                    return null;
                }
                return asDate ? new Date(item.expiry) : item.expiry;
            }
            catch (error) {
                return null;
            }
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
    if (typeof window !== 'undefined') {
        window.LocalStorage = LocalStorage;
    }
    if (typeof global !== 'undefined') {
        global.LocalStorage = LocalStorage;
    }

    exports.LocalStorage = LocalStorage;

}));
//# sourceMappingURL=main.umd.js.map
