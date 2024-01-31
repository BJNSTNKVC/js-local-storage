# LocalStorage

A class that provides a set of methods for interacting with the browser's local storage.

## Installation & setup

### NPM

You can install the package via npm:

```bash
npm install @bjnstnkvc/local-storage
````

### CDN

You can install the package via jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@bjnstnkvc/local-storage/lib/main.min.js"></script>
```


## Usage

### set

Set the value for a given key in the Local Storage.

##### Parameters
- **key** - String containing the name of the key.
- **value** - The value to be stored.
- **ttl** *(optional)* - Time to live in seconds for the key. Defaults to `null` (no expiration).

##### Example

```javascript
LocalStorage.set('key', 'value', 60); 
```

### get

Retrieve the value associated with the given key from the Local Storage.

#### Parameters

- **key** - String containing the name of the key.
- **fallback** *(optional)* - Fallback value if the key does not exist. Can be provided as a string or an object with the following properties:
  - **value** - The fallback value to be used if the key does not exist.
  - **ttl** - Time to live in seconds for the fallback key if it needs to be set. Defaults to `null` (no expiration).
  - **persist** *(optional)* - Boolean indicating whether the fallback value should be persisted in the Local Storage. Defaults to `false`.

#### Example

```javascript
LocalStorage.get('key', 'default');
````
```javascript
LocalStorage.get('key', { value: 'default', ttl: 60, persist: true });
```
### all

Retrieve an object containing all keys and their associated values stored in the Local Storage.

#### Example

```javascript
LocalStorage.all();
```
### remove

Remove the key and its associated value from the Local Storage.

#### Parameters

- **key** - String containing the name of the key to be deleted.

#### Example

```javascript
LocalStorage.remove('key');
```
### clear

Clear all keys and their associated values from the Local Storage.

#### Example

```javascript
LocalStorage.clear();
```
### has

Check if a key exists in the Local Storage.

#### Parameters

- **key** - String containing the name of the key to be checked.

#### Example

```javascript
LocalStorage.has('key');
```

### hasAny

Check if any of the provided keys exist in the Local Storage.

#### Parameters

- **keys** - String or an array of strings containing the names of the keys to be checked.

#### Example

```javascript
LocalStorage.hasAny(['key1', 'key2']);
```

### isEmpty

Check if the Local Storage is empty.

#### Example

```javascript
LocalStorage.isEmpty();
```
### isNotEmpty

Check if the Local Storage is not empty.

#### Example

```javascript
LocalStorage.isNotEmpty();
```
### keys

Retrieve an array containing all keys stored in the Local Storage.

#### Example

```javascript
LocalStorage.keys();
```
### count

Retrieve the total number of items stored in the Local Storage.

#### Example

```javascript
LocalStorage.count();
```
### touch

Update the expiration time of a key in the Local Storage.

#### Parameters

- **key** - String containing the name of the key.
- **ttl** *(optional)* - Time to live in seconds for the key. Defaults to `null` (no expiration).

#### Example

```javascript
LocalStorage.touch('key', 60);
```
### dump

Print the value associated with a key to the console.

#### Parameters

- **key** - String containing the name of the key.

#### Example

```javascript
LocalStorage.dump('key');
```
