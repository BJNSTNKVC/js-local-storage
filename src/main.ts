const LocalStorage = class {
	/**
	 * Default item validity period in seconds.
	 *
	 * @type { number | null }
	 */
	static ttl: number | null = null;

	/**
	 * Set the key to the Storage object.
	 *
	 * @param { string } key String containing the name of the key you want to create.
	 * @param { * } value Value you want to give the key you are creating.
	 * @param { number|null } ttl Item validity period in seconds.
	 */
	static set(key: string, value: any, ttl: number | null = null): void {
		ttl = ttl ?? LocalStorage.ttl;

		const item = {
			data  : value,
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
	static get(key: string, fallback: string | { value: string, ttl: number | null, persist?: boolean } | null = null): any {
		const storageItem = localStorage.getItem(key);

		if (!storageItem) {
			if (fallback === null) {
				return null;
			}

			switch (typeof fallback) {
				case 'string':
					return fallback;
				case 'object':
					return fallback.persist ? LocalStorage.set(key, fallback.value, fallback.ttl ?? LocalStorage.ttl) : fallback.value;
				default:
					return null;
			}
		}

		const item: { data: any, expiry: number | null } = JSON.parse(storageItem);

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
	static all(): object {
		const storage: object | any = { ...localStorage };

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
	static remove(key: string): void {
		localStorage.removeItem(key);
	}

	/**
	 * Clear all keys stored in a given Storage object.
	 */
	static clear(): void {
		localStorage.clear();
	}

	/**
	 * Determine if the key exists in the Storage object.
	 *
	 * @param { string } key String containing the name of the key you want to check against
	 *
	 * @return { boolean }
	 */
	static has(key: string): boolean {
		return !!LocalStorage.get(key);
	}

	/**
	 * Determine if any of the keys exists in the Storage object.
	 *
	 * @param { string|array } keys String containing the name of the key you want to check against
	 *
	 * @return { boolean }
	 */
	static hasAny(keys: string | string[]): boolean {
		keys = keys instanceof Array ? keys : [...arguments];

		return keys.filter(key => LocalStorage.has(key)).length > 0;
	}

	/**
	 * Determine if the Storage object is empty.
	 *
	 * @return { boolean }
	 */
	static isEmpty(): boolean {
		return localStorage.length === 0;
	}

	/**
	 * Determine if the Storage object is not empty.
	 *
	 * @return { boolean }
	 */
	static isNotEmpty(): boolean {
		return !LocalStorage.isEmpty();
	}

	/**
	 * Retrieves all keys from the Storage object.
	 *
	 * @return { array }
	 */
	static keys(): string[] {
		return Object.keys(localStorage);
	}

	/**
	 * Returns the total number of items in the Storage object.
	 *
	 * @return { number }
	 */
	static count(): number {
		return localStorage.length;
	}

	/**
	 * Updates the item expiration time.
	 *
	 * @param { string } key String containing the name of the key you want to update.
	 * @param { number|null } ttl Item validity period in seconds.
	 */
	static touch(key: string, ttl: number | null = null): void {
		const item = LocalStorage.get(key);

		if (!item) {
			return;
		}

		LocalStorage.set(key, item, ttl ?? LocalStorage.ttl);
	}

	/**
	 * Dump the key from the Storage object.
	 *
	 * @param { string } key String containing the name of the key you want to dump.
	 */
	static dump(key: string): void {
		console.log(LocalStorage.get(key));
	}
};

if (typeof exports != 'undefined') {
	module.exports.LocalStorage = LocalStorage;
}