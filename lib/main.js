"use strict";
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var _a;
const LocalStorage = (_a = class {
        /**
         * Set the key to the Storage object.
         *
         * @param { string } key String containing the name of the key you want to create.
         * @param { * } value Value you want to give the key you are creating.
         * @param { number|null } ttl Item validity period in seconds.
         */
        static set(key, value, ttl = null) {
            ttl = ttl !== null && ttl !== void 0 ? ttl : LocalStorage.ttl;
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
         * @param { string|object|null } fallback String or an Object containing the fallback value.
         *
         * @return { * }
         */
        static get(key, fallback = null) {
            var _b;
            const storageItem = localStorage.getItem(key);
            if (!storageItem) {
                if (fallback === null) {
                    return null;
                }
                switch (typeof fallback) {
                    case 'string':
                        return fallback;
                    case 'object':
                        return fallback.persist ? LocalStorage.set(key, fallback.value, (_b = fallback.ttl) !== null && _b !== void 0 ? _b : LocalStorage.ttl) : fallback.value;
                    default:
                        return null;
                }
            }
            const item = JSON.parse(storageItem);
            if (item.expiry && Date.now() > item.expiry) {
                LocalStorage.remove(key);
                return null;
            }
            return item.data;
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
         * @param { string|array } keys String containing the name of the key you want to check against
         *
         * @return { boolean }
         */
        static hasAny(keys) {
            keys = keys instanceof Array ? keys : [...arguments];
            return keys.filter(key => LocalStorage.has(key)).length > 0;
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
         * @param { number|null } ttl Item validity period in seconds.
         */
        static touch(key, ttl = null) {
            const item = LocalStorage.get(key);
            if (!item) {
                return;
            }
            LocalStorage.set(key, item, ttl !== null && ttl !== void 0 ? ttl : LocalStorage.ttl);
        }
        /**
         * Dump the key from the Storage object.
         *
         * @param { string } key String containing the name of the key you want to dump.
         */
        static dump(key) {
            console.log(LocalStorage.get(key));
        }
    },
    __setFunctionName(_a, "LocalStorage"),
    /**
     * Default item validity period in seconds.
     *
     * @type { number | null }
     */
    _a.ttl = null,
    _a);
if (typeof exports != 'undefined') {
    module.exports.LocalStorage = LocalStorage;
}
//# sourceMappingURL=main.js.map