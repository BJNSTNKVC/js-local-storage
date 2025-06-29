(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.LocalStorage = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }

    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var _a, _LocalStorage_ttl;
    class LocalStorage {
        /**
         * Set the default item validity period in seconds.
         *
         * @param { number | null } value
         */
        static ttl(value) {
            __classPrivateFieldSet(this, _a, value, "f", _LocalStorage_ttl);
        }
        /**
         * Set the key to the Storage object.
         *
         * @param { string } key String containing the name of the key you want to create.
         * @param { * } value Value you want to give the key you are creating.
         * @param { number | null } ttl Item validity period in seconds.
         */
        static set(key, value, ttl = null) {
            ttl = ttl !== null && ttl !== void 0 ? ttl : __classPrivateFieldGet(this, _a, "f", _LocalStorage_ttl);
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
            var _b;
            const storageItem = localStorage.getItem(key);
            if (storageItem === null) {
                return fallback instanceof Function ? fallback() : fallback !== null && fallback !== void 0 ? fallback : null;
            }
            try {
                const item = JSON.parse(storageItem);
                if (item.expiry && Date.now() > item.expiry) {
                    this.remove(key);
                    return null;
                }
                return (_b = item.data) !== null && _b !== void 0 ? _b : item;
            }
            catch (_c) {
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
            const item = this.get(key);
            if (item === null) {
                this.set(key, callback, ttl !== null && ttl !== void 0 ? ttl : __classPrivateFieldGet(this, _a, "f", _LocalStorage_ttl));
            }
            return item !== null && item !== void 0 ? item : this.get(key);
        }
        /**
         * Retrieves all items from the Storage object.
         *
         * @return { object }
         */
        static all() {
            return Object.fromEntries(Object.keys(localStorage).map((key) => [key, this.get(key)]));
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
            return !!this.get(key);
        }
        /**
         * Determine if any of the keys exists in the Storage object.
         *
         * @param { string | array } keys String containing the name of the key you want to check against
         *
         * @return { boolean }
         */
        static hasAny(...keys) {
            if (keys.length === 1) {
                if (Array.isArray(keys[0])) {
                    keys = keys[0];
                }
                else {
                    keys = [keys[0]];
                }
            }
            return keys.some((key) => this.has(key));
        }
        /**
         * Determine if the Storage object is empty.
         *
         * @return { boolean }
         */
        static isEmpty() {
            return Object.keys(this.all()).length === 0;
        }
        /**
         * Determine if the Storage object is not empty.
         *
         * @return { boolean }
         */
        static isNotEmpty() {
            return !this.isEmpty();
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
            const item = this.get(key);
            if (item === null) {
                return;
            }
            this.set(key, item, ttl !== null && ttl !== void 0 ? ttl : __classPrivateFieldGet(this, _a, "f", _LocalStorage_ttl));
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
            catch (_b) {
                return null;
            }
        }
        /**
         * Dump the key from the Storage object.
         *
         * @param { string } key String containing the name of the key you want to dump.
         */
        static dump(key) {
            console.log(this.get(key));
        }
    }
    _a = LocalStorage;
    /**
     * Default item validity period in seconds.
     *
     * @type { number | null }
     */
    _LocalStorage_ttl = { value: null };
    if (typeof window !== 'undefined') {
        window.LocalStorage = LocalStorage;
    }
    if (typeof global !== 'undefined') {
        global.LocalStorage = LocalStorage;
    }

    exports.LocalStorage = LocalStorage;

}));
//# sourceMappingURL=main.umd.js.map
