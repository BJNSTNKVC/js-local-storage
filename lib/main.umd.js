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

    var _LocalStorageFake_used, _LocalStorageFake_quota;
    class LocalStorageFake {
        /**
         * Create a new Storage instance.
         */
        constructor() {
            /**
             * Current used storage in bytes.
             *
             * @type { number }
             */
            _LocalStorageFake_used.set(this, 0);
            /**
             * Maximum storage quota (5MB for most modern browsers).
             *
             * @type { number }
             */
            _LocalStorageFake_quota.set(this, 5 * 1024 * 1024);
            __classPrivateFieldSet(this, _LocalStorageFake_used, this.space(), "f");
        }
        /**
         * Returns an integer representing the number of data items stored in the Storage object.
         *
         * @return { number }
         */
        get length() {
            return Object.keys(this).length;
        }
        /**
         * When passed a key name, will return that key's value.
         *
         * @param { string } keyName
         *
         * @return { any }
         */
        getItem(keyName) {
            return this[keyName] || null;
        }
        /**
         * When passed a key name and value, will add that key to the storage, or update that key's value if it already exists.
         *
         * @param { string } keyName
         * @param { string } keyValue
         *
         * @return { void }
         */
        setItem(keyName, keyValue) {
            const value = String(keyValue);
            if (this.exceeded(keyName, value)) {
                this.throw(keyName);
            }
            this[keyName] = value;
            __classPrivateFieldSet(this, _LocalStorageFake_used, this.space(), "f");
        }
        /**
         * When passed a key name, will remove that key from the storage.
         *
         * @param { string } keyName
         *
         * @return { void }
         */
        removeItem(keyName) {
            delete this[keyName];
            __classPrivateFieldSet(this, _LocalStorageFake_used, this.space(), "f");
        }
        /**
         * When invoked, will empty all keys out of the storage.
         *
         * @return { void }
         */
        clear() {
            for (const key of Object.keys(this)) {
                delete this[key];
            }
            __classPrivateFieldSet(this, _LocalStorageFake_used, this.space(), "f");
        }
        /**
         * When passed a number n, returns the name of the nth key in a given Storage object.
         *
         * @param { number } index
         *
         * @return { string | null }
         */
        key(index) {
            var _a;
            return (_a = Object.keys(this)[index]) !== null && _a !== void 0 ? _a : null;
        }
        /**
         * Calculate current used storage space in bytes.
         *
         * @return { number }
         */
        space() {
            __classPrivateFieldSet(this, _LocalStorageFake_used, 0, "f");
            for (const key of Object.keys(this)) {
                __classPrivateFieldSet(this, _LocalStorageFake_used, __classPrivateFieldGet(this, _LocalStorageFake_used, "f") + this.size(key, this[key]), "f");
            }
            return __classPrivateFieldGet(this, _LocalStorageFake_used, "f");
        }
        /**
         * Calculate the size a new item would take in bytes.
         *
         * @param { string } keyName
         * @param { string } keyValue
         *
         * @return { number }
         */
        size(keyName, keyValue) {
            return new Blob([keyName, keyValue]).size;
        }
        /**
         * Determine if the Storage quota is exceeded.
         *
         * @param { string } keyName
         * @param { string } keyValue
         *
         * @return { boolean }
         */
        exceeded(keyName, keyValue) {
            return this.size(keyName, keyValue) + __classPrivateFieldGet(this, _LocalStorageFake_used, "f") > __classPrivateFieldGet(this, _LocalStorageFake_quota, "f");
        }
        /**
         * Throws an error in case the Storage quota is exceeded.
         *
         * @param { string } keyName
         *
         * @return { void }
         */
        throw(keyName) {
            throw new DOMException(`Failed to execute 'setItem' on 'Storage': Setting the value of '${keyName}' exceeded the quota.`, 'QuotaExceededError');
        }
    }
    _LocalStorageFake_used = new WeakMap(), _LocalStorageFake_quota = new WeakMap();

    var _StorageFlushing_key;
    class StorageFlushing extends Event {
        /**
         * Create a new Storage Flushing Event instance.
         */
        constructor() {
            super('local-storage:flushing');
            /**
             * The key of the event.
             *
             * @type { string }
             */
            _StorageFlushing_key.set(this, void 0);
        }
        /**
         * Get the key of the event.
         *
         * @return { string }
         */
        get key() {
            return __classPrivateFieldGet(this, _StorageFlushing_key, "f");
        }
    }
    _StorageFlushing_key = new WeakMap();

    var _StorageFlushed_key;
    class StorageFlushed extends Event {
        /**
         * Create a new Storage Flushed Event instance.
         */
        constructor() {
            super('local-storage:flushed');
            /**
             * The key of the event.
             *
             * @type { string }
             */
            _StorageFlushed_key.set(this, void 0);
        }
        /**
         * Get the key of the event.
         *
         * @return { string }
         */
        get key() {
            return __classPrivateFieldGet(this, _StorageFlushed_key, "f");
        }
    }
    _StorageFlushed_key = new WeakMap();

    var _RetrievingKey_key;
    class RetrievingKey extends Event {
        /**
         * Create a new Retrieving Key Event instance.
         *
         * @param { string } key
         */
        constructor(key) {
            super('local-storage:retrieving');
            /**
             * The key of the event.
             *
             * @type { string }
             */
            _RetrievingKey_key.set(this, void 0);
            __classPrivateFieldSet(this, _RetrievingKey_key, key, "f");
        }
        /**
         * Get the key of the event.
         *
         * @return { string }
         */
        get key() {
            return __classPrivateFieldGet(this, _RetrievingKey_key, "f");
        }
    }
    _RetrievingKey_key = new WeakMap();

    var _KeyHit_key, _KeyHit_value;
    class KeyHit extends Event {
        /**
         * Create a new Key Hit Event instance.
         *
         * @param { string } key
         * @param { string } value
         */
        constructor(key, value) {
            super('local-storage:hit');
            /**
             * The key of the event.
             *
             * @type { string }
             */
            _KeyHit_key.set(this, void 0);
            /**
             * The value of the key.
             *
             * @type { string }
             */
            _KeyHit_value.set(this, void 0);
            __classPrivateFieldSet(this, _KeyHit_key, key, "f");
            __classPrivateFieldSet(this, _KeyHit_value, value, "f");
        }
        /**
         * Get the key of the event.
         *
         * @return { string }
         */
        get key() {
            return __classPrivateFieldGet(this, _KeyHit_key, "f");
        }
        /**
         * Get the value of the key.
         *
         * @return { * }
         */
        get value() {
            return __classPrivateFieldGet(this, _KeyHit_value, "f");
        }
    }
    _KeyHit_key = new WeakMap(), _KeyHit_value = new WeakMap();

    var _KeyMissed_key;
    class KeyMissed extends Event {
        /**
         * Create a new Key Missed Event instance.
         *
         * @param { string } key
         */
        constructor(key) {
            super('local-storage:missed');
            /**
             * The key of the event.
             *
             * @type { string }
             */
            _KeyMissed_key.set(this, void 0);
            __classPrivateFieldSet(this, _KeyMissed_key, key, "f");
        }
        /**
         * Get the key of the event.
         *
         * @return { string }
         */
        get key() {
            return __classPrivateFieldGet(this, _KeyMissed_key, "f");
        }
    }
    _KeyMissed_key = new WeakMap();

    var _KeyWriteFailed_key, _KeyWriteFailed_value, _KeyWriteFailed_expiry;
    class KeyWriteFailed extends Event {
        /**
         * Create a new Key Write Failed Event instance.
         *
         * @param { string } key
         * @param { string } value
         * @param { number | null } expiry
         */
        constructor(key, value, expiry = null) {
            super('local-storage:write-failed');
            /**
             * The key of the event.
             *
             * @type { string }
             */
            _KeyWriteFailed_key.set(this, void 0);
            /**
             * The value of the key.
             *
             * @type { string }
             */
            _KeyWriteFailed_value.set(this, void 0);
            /**
             * The validity period in seconds since Unix Epoch.
             *
             * @type { number | number }
             */
            _KeyWriteFailed_expiry.set(this, void 0);
            __classPrivateFieldSet(this, _KeyWriteFailed_key, key, "f");
            __classPrivateFieldSet(this, _KeyWriteFailed_value, value, "f");
            __classPrivateFieldSet(this, _KeyWriteFailed_expiry, expiry, "f");
        }
        /**
         * Get the key of the event.
         *
         * @return { string }
         */
        get key() {
            return __classPrivateFieldGet(this, _KeyWriteFailed_key, "f");
        }
        /**
         * Get the value of the key.
         *
         * @return { * }
         */
        get value() {
            return __classPrivateFieldGet(this, _KeyWriteFailed_value, "f");
        }
        /**
         * Get the validity period in milliseconds since Unix Epoch.
         *
         * @return { number | null }
         */
        get expiry() {
            return __classPrivateFieldGet(this, _KeyWriteFailed_expiry, "f");
        }
    }
    _KeyWriteFailed_key = new WeakMap(), _KeyWriteFailed_value = new WeakMap(), _KeyWriteFailed_expiry = new WeakMap();

    var _KeyWritten_key, _KeyWritten_value, _KeyWritten_expiry;
    class KeyWritten extends Event {
        /**
         * Create a new Key Written Event instance.
         *
         * @param { string } key
         * @param { string } value
         * @param { number | null} expiry
         */
        constructor(key, value, expiry = null) {
            super('local-storage:written');
            /**
             * The key of the event.
             *
             * @type { string }
             */
            _KeyWritten_key.set(this, void 0);
            /**
             * The value of the key.
             *
             * @type { string }
             */
            _KeyWritten_value.set(this, void 0);
            /**
             * The validity period in seconds since Unix Epoch.
             *
             * @type { number | number }
             */
            _KeyWritten_expiry.set(this, void 0);
            __classPrivateFieldSet(this, _KeyWritten_key, key, "f");
            __classPrivateFieldSet(this, _KeyWritten_value, value, "f");
            __classPrivateFieldSet(this, _KeyWritten_expiry, expiry, "f");
        }
        /**
         * Get the key of the event.
         *
         * @return { string }
         */
        get key() {
            return __classPrivateFieldGet(this, _KeyWritten_key, "f");
        }
        /**
         * Get the value of the key.
         *
         * @return { * }
         */
        get value() {
            return __classPrivateFieldGet(this, _KeyWritten_value, "f");
        }
        /**
         * Get the validity period in milliseconds since Unix Epoch.
         *
         * @return { number | null }
         */
        get expiry() {
            return __classPrivateFieldGet(this, _KeyWritten_expiry, "f");
        }
    }
    _KeyWritten_key = new WeakMap(), _KeyWritten_value = new WeakMap(), _KeyWritten_expiry = new WeakMap();

    var _WritingKey_key, _WritingKey_value, _WritingKey_expiry;
    class WritingKey extends Event {
        /**
         * Create a new Writing Key Event instance.
         *
         * @param { string } key
         * @param { string } value
         * @param { number | null} expiry
         */
        constructor(key, value, expiry = null) {
            super('local-storage:writing');
            /**
             * The key of the event.
             *
             * @type { string }
             */
            _WritingKey_key.set(this, void 0);
            /**
             * The value of the key.
             *
             * @type { string }
             */
            _WritingKey_value.set(this, void 0);
            /**
             * The validity period in seconds since Unix Epoch.
             *
             * @type { number | number }
             */
            _WritingKey_expiry.set(this, void 0);
            __classPrivateFieldSet(this, _WritingKey_key, key, "f");
            __classPrivateFieldSet(this, _WritingKey_value, value, "f");
            __classPrivateFieldSet(this, _WritingKey_expiry, expiry, "f");
        }
        /**
         * Get the key of the event.
         *
         * @return { string }
         */
        get key() {
            return __classPrivateFieldGet(this, _WritingKey_key, "f");
        }
        /**
         * Get the value of the key.
         *
         * @return { * }
         */
        get value() {
            return __classPrivateFieldGet(this, _WritingKey_value, "f");
        }
        /**
         * Get the validity period in milliseconds since Unix Epoch.
         *
         * @return { number | null }
         */
        get expiry() {
            return __classPrivateFieldGet(this, _WritingKey_expiry, "f");
        }
    }
    _WritingKey_key = new WeakMap(), _WritingKey_value = new WeakMap(), _WritingKey_expiry = new WeakMap();

    var _KeyForgotten_key;
    class KeyForgotten extends Event {
        /**
         * Create a new Key Forgotten Event instance.
         *
         * @param { string } key
         */
        constructor(key) {
            super('local-storage:forgot');
            /**
             * The key of the event.
             *
             * @type { string }
             */
            _KeyForgotten_key.set(this, void 0);
            __classPrivateFieldSet(this, _KeyForgotten_key, key, "f");
        }
        /**
         * Get the key of the event.
         *
         * @return { string }
         */
        get key() {
            return __classPrivateFieldGet(this, _KeyForgotten_key, "f");
        }
    }
    _KeyForgotten_key = new WeakMap();

    var _KeyForgotFailed_key;
    class KeyForgotFailed extends Event {
        /**
         * Create a new Key Forgot Failed Event instance.
         *
         * @param { string } key
         */
        constructor(key) {
            super('local-storage:forgot-failed');
            /**
             * The key of the event.
             *
             * @type { string }
             */
            _KeyForgotFailed_key.set(this, void 0);
            __classPrivateFieldSet(this, _KeyForgotFailed_key, key, "f");
        }
        /**
         * Get the key of the event.
         *
         * @return { string }
         */
        get key() {
            return __classPrivateFieldGet(this, _KeyForgotFailed_key, "f");
        }
    }
    _KeyForgotFailed_key = new WeakMap();

    var _a, _LocalStorage_storage, _LocalStorage_ttl;
    class LocalStorage {
        /**
         * Set the default item validity period in seconds.
         *
         * @param { number | null } value
         *
         * @return { void }
         */
        static ttl(value) {
            __classPrivateFieldSet(this, _a, value, "f", _LocalStorage_ttl);
        }
        /**
         * Set the key to the Storage object.
         *
         * @param { string } key
         * @param { * } value
         * @param { number | null } ttl
         *
         * @return { boolean }
         */
        static set(key, value, ttl = null) {
            ttl = ttl !== null && ttl !== void 0 ? ttl : __classPrivateFieldGet(this, _a, "f", _LocalStorage_ttl);
            const item = {
                data: typeof value === 'function' ? value() : value,
                expiry: ttl ? Date.now() + ttl * 1000 : null
            };
            this.emit(new WritingKey(key, item.data, item.expiry));
            try {
                __classPrivateFieldGet(this, _a, "f", _LocalStorage_storage).setItem(key, JSON.stringify(item));
                this.emit(new KeyWritten(key, item.data, item.expiry));
            }
            catch (_b) {
                this.emit(new KeyWriteFailed(key, item.data, item.expiry));
                return false;
            }
            return true;
        }
        /**
         * Get the key from the Storage object.
         *
         * @param { string } key
         * @param { string | Function | null } fallback
         *
         * @return { * }
         */
        static get(key, fallback = null) {
            var _b;
            this.emit(new RetrievingKey(key));
            const storageItem = __classPrivateFieldGet(this, _a, "f", _LocalStorage_storage).getItem(key);
            if (storageItem === null) {
                this.emit(new KeyMissed(key));
                return typeof fallback === 'function' ? fallback() : fallback;
            }
            let value;
            try {
                const item = JSON.parse(storageItem);
                if (item.expiry && Date.now() > item.expiry) {
                    this.remove(key);
                    return null;
                }
                value = (_b = item.data) !== null && _b !== void 0 ? _b : item;
            }
            catch (_c) {
                value = storageItem;
            }
            this.emit(new KeyHit(key, value));
            return value;
        }
        /**
         * Get the key from the Storage, or execute the given callback and store the result.
         *
         * @param { string } key
         * @param { Function } callback
         * @param { number | null } ttl
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
         * @return { { key: string, value: any }[] }
         */
        static all() {
            return this.keys().map((key) => {
                return { key, value: this.get(key) };
            });
        }
        /**
         * Remove the key from the Storage object.
         *
         * @param { string } key
         *
         * @return { boolean }
         */
        static remove(key) {
            if (this.has(key)) {
                __classPrivateFieldGet(this, _a, "f", _LocalStorage_storage).removeItem(key);
                this.emit(new KeyForgotten(key));
                return true;
            }
            else {
                this.emit(new KeyForgotFailed(key));
                return false;
            }
        }
        /**
         * Clear all keys stored in a given Storage object.
         *
         * @return { void }
         */
        static clear() {
            this.emit(new StorageFlushing());
            __classPrivateFieldGet(this, _a, "f", _LocalStorage_storage).clear();
            this.emit(new StorageFlushed());
        }
        /**
         * Determine if the key exists in the Storage object.
         *
         * @param { string } key
         *
         * @return { boolean }
         */
        static has(key) {
            return !!this.get(key);
        }
        /**
         * Determine if the key does not exist in the Storage object.
         *
         * @param { string } key
         *
         * @return { boolean }
         */
        static missing(key) {
            return !this.has(key);
        }
        /**
         * Determine if any of the keys exists in the Storage object.
         *
         * @param { string | string[] } keys
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
            return __classPrivateFieldGet(this, _a, "f", _LocalStorage_storage).length === 0;
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
         * @return { string[] }
         */
        static keys() {
            return Object.keys(__classPrivateFieldGet(this, _a, "f", _LocalStorage_storage));
        }
        /**
         * Returns the total number of items in the Storage object.
         *
         * @return { number }
         */
        static count() {
            return __classPrivateFieldGet(this, _a, "f", _LocalStorage_storage).length;
        }
        /**
         * Updates the item expiration time.
         *
         * @param { string } key
         * @param { number | null } ttl
         *
         * @return { boolean }
         */
        static touch(key, ttl = null) {
            const item = this.get(key);
            if (item === null) {
                return false;
            }
            return this.set(key, item, ttl !== null && ttl !== void 0 ? ttl : __classPrivateFieldGet(this, _a, "f", _LocalStorage_ttl));
        }
        /**
         * Returns the expiration date for a given key.
         *
         * @param { string } key
         *
         * @return { Date | null }
         */
        static expiry(key) {
            const storageItem = __classPrivateFieldGet(this, _a, "f", _LocalStorage_storage).getItem(key);
            if (storageItem === null) {
                return null;
            }
            try {
                const item = JSON.parse(storageItem);
                if (item === null || item.expiry === undefined || item.expiry === null) {
                    return null;
                }
                return new Date(item.expiry);
            }
            catch (_b) {
                return null;
            }
        }
        /**
         * Dump the key from the Storage object.
         *
         * @param { string } key
         */
        static dump(key) {
            console.log(this.get(key));
        }
        /**
         * Replace the Local Storage instance with a fake.
         *
         * @return { void }
         */
        static fake() {
            __classPrivateFieldSet(this, _a, new LocalStorageFake(), "f", _LocalStorage_storage);
        }
        /**
         * Restore the Local Storage instance.
         *
         * @return { void }
         */
        static restore() {
            __classPrivateFieldSet(this, _a, localStorage, "f", _LocalStorage_storage);
        }
        /**
         * Determines whether a "fake" has been set as the Local Storage instance.
         *
         * @return { boolean }
         */
        static isFake() {
            return __classPrivateFieldGet(this, _a, "f", _LocalStorage_storage) instanceof LocalStorageFake;
        }
        static listen(events, listener = null) {
            events = typeof events === 'string' ? { [events]: listener } : events;
            for (const [event, listener] of Object.entries(events)) {
                addEventListener(`local-storage:${event}`, listener, { once: true });
            }
        }
        /**
         * Register a listener on "retrieving" event.
         *
         * @param { (event: RetrievingKey) => void } listener
         *
         * @return { void }
         */
        static onRetrieving(listener) {
            this.listen('retrieving', listener);
        }
        /**
         * Register a listener on "hit" event.
         *
         * @param { (event: KeyHit) => void } listener
         *
         * @return { void }
         */
        static onHit(listener) {
            this.listen('hit', listener);
        }
        /**
         * Register a listener on "missed" event.
         *
         * @param { (event: KeyMissed) => void } listener
         *
         * @return { void }
         */
        static onMissed(listener) {
            this.listen('missed', listener);
        }
        /**
         * Register a listener on "writing" event.
         *
         * @param { (event: WritingKey) => void } listener
         *
         * @return { void }
         */
        static onWriting(listener) {
            this.listen('writing', listener);
        }
        /**
         * Register a listener on "written" event.
         *
         * @param { (event: KeyWritten) => void } listener
         *
         * @return { void }
         */
        static onWritten(listener) {
            this.listen('written', listener);
        }
        /**
         * Register a listener on "failed" event.
         *
         * @param { (event: KeyWriteFailed) => void } listener
         *
         * @return { void }
         */
        static onWriteFailed(listener) {
            this.listen('write-failed', listener);
        }
        /**
         * Register a listener on "forgot" event.
         *
         * @param { (event: KeyForgotten) => void } listener
         *
         * @return { void }
         */
        static onForgot(listener) {
            this.listen('forgot', listener);
        }
        /**
         * Register a listener on "forgot-failed" event.
         *
         * @param { (event: KeyForgotFailed) => void } listener
         *
         * @return { void }
         */
        static onForgotFailed(listener) {
            this.listen('forgot-failed', listener);
        }
        /**
         * Register a listener on "flushing" event.
         *
         * @param { (event: StorageFlushing) => void } listener
         *
         * @return { void }
         */
        static onFlushing(listener) {
            this.listen('flushing', listener);
        }
        /**
         * Register a listener on "flushed" event.
         *
         * @param { (event: StorageFlushed) => void } listener
         *
         * @return { void }
         */
        static onFlushed(listener) {
            this.listen('flushed', listener);
        }
        /**
         * Emit an event for the Local Storage instance.
         *
         * @template { keyof LocalStorageEvents } K
         *
         * @param { LocalStorageEvent[K] } event
         *
         * @returns { void }
         */
        static emit(event) {
            dispatchEvent(event);
        }
    }
    _a = LocalStorage;
    /**
     * Current Storage instance.
     *
     * @type { Storage }
     */
    _LocalStorage_storage = { value: localStorage };
    /**
     * Item validity period in seconds.
     *
     * @type { number | null }
     */
    _LocalStorage_ttl = { value: null };

    exports.KeyForgotFailed = KeyForgotFailed;
    exports.KeyForgotten = KeyForgotten;
    exports.KeyHit = KeyHit;
    exports.KeyMissed = KeyMissed;
    exports.KeyWriteFailed = KeyWriteFailed;
    exports.KeyWritten = KeyWritten;
    exports.LocalStorage = LocalStorage;
    exports.LocalStorageFake = LocalStorageFake;
    exports.RetrievingKey = RetrievingKey;
    exports.StorageFlushed = StorageFlushed;
    exports.StorageFlushing = StorageFlushing;
    exports.WritingKey = WritingKey;

}));
//# sourceMappingURL=main.umd.js.map
