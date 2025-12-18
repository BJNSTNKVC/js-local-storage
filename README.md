# LocalStorage

A class that provides a set of methods for interacting with the browser's local storage.

## Installation & setup

### NPM

You can install the package via npm:

```bash
npm install @bjnstnkvc/local-storage
````

and then import it into your project

```javascript
import { LocalStorage } from '@bjnstnkvc/local-storage';
```

### CDN

You can install the package via jsDelivr CDN:

```html

<script src="https://cdn.jsdelivr.net/npm/@bjnstnkvc/local-storage/lib/main.min.js"></script>
```

## Usage

### set

Set the value for a given key in the Local Storage.

#### Parameters

- **key** - String containing the name of the key.
- **value** - The value to be stored.
- **ttl** *(optional)* - Time to live in seconds for the key. Defaults to `null` (no expiration) or equal
  to [LocalStorage.ttl](#ttl) value.

#### Example

```javascript
LocalStorage.set('key', 'value', 60); 
```

### get

Retrieve the value associated with the given key from the Local Storage.

#### Parameters

- **key** - String containing the name of the key.
- **fallback** *(optional)* - The fallback value in case the key does not exist. Defaults to `null`.

#### Example

```javascript
LocalStorage.get('key', 'default');
````

You can also pass a closure as the default value. If the specified item is not found in the Local Storage, the closure
will be executed and its result returned.
This allows you to lazily load default values from other sources:

```javascript
LocalStorage.get('key', () => 'default');
````

> **Note:** When you attempt to retrieve a value using the `get` method, it checks if the item has expired based on its
> TTL (Time-To-Live). If the item has indeed expired, it is automatically removed from the LocalStorage, ensuring that
> your application only works with valid, up-to-date data.

### remember

Retrieve the value associated with the given key, or execute the given callback and store the result in the Local
Storage.

#### Parameters

- **key** - String containing the name of the key.
- **fallback** - Function you want to execute.
- **ttl** *(optional)* - Time to live in seconds for the key. Defaults to `null` (no expiration) or equal
  to [LocalStorage.ttl](#ttl) value.

#### Example

```javascript
LocalStorage.remember('key', () => 'default', 60);
````

### all

Retrieve an array containing all keys and their associated values stored in the Local Storage.

#### Example

```javascript
LocalStorage.all();
```

> **Note:** The `all` method returns an array of objects with `key` and `value` properties (e.g.
`[{ key: 'key', value: 'value' }]`)

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

### missing

Check if a key does not exist in the Local Storage.

#### Parameters

- **key** - String containing the name of the key to be checked.

#### Example

```javascript
LocalStorage.missing('key');
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
- **ttl** *(optional)* - Time to live in seconds for the key. Defaults to `null` (no expiration) or equal
  to [LocalStorage.ttl](#ttl) value.

#### Example

```javascript
LocalStorage.touch('key', 60);
```

### expiry

Retrieve the expiration date for a given key.

#### Parameters

- **key** - String containing the name of the key you want to check against

#### Example

```javascript
LocalStorage.expiry('key');
```

You can also pass a boolean as the second parameter to return the expiration date as a Date object:

```javascript
LocalStorage.expiry('key', true);
```

### dump

Print the value associated with a key to the console.

#### Parameters

- **key** - String containing the name of the key.

#### Example

```javascript
LocalStorage.dump('key');
```

### fake

Replace the Local Storage instance with a fake implementation. This is particularly useful for testing purposes where
you want to avoid interacting with the actual browser's Local Storage.

#### Example

```javascript
LocalStorage.fake();
```

### restore

Restore the original Local Storage instance. This is typically used after [fake()](#fake) to return to using the real
browser's Local Storage.

#### Example

```javascript
LocalStorage.restore();
```

### isFake

Check if a fake Local Storage instance is currently being used.

#### Example

```javascript
if (LocalStorage.isFake()) {
    // ...
}
```

### ttl

Define a global Time-To-Live (TTL) in seconds for all items saved using the [LocalStorage.set](#set)
or [LocalStorage.touch](#touch) method, without specifying a TTL for each item. This can be particularly useful for
applications needing a consistent expiry policy for most stored data.

#### Example

```javascript
LocalStorage.ttl(7200);
```

If a default TTL has been set using `LocalStorage.ttl`, it will be applied to all items set without a specified TTL.

## Events

In case you would like to execute a callback on Local Storage operation, you may listen for various events dispatched by
the Local Storage.

| Type            | Event           |
|-----------------|-----------------|
| `retrieving`    | RetrievingKey   |
| `hit`           | KeyHit          |
| `missed`        | KeyMissed       |
| `writing`       | WritingKey      |
| `written`       | KeyWritten      |
| `write-failed`  | KeyWriteFailed  |
| `forgot`        | KeyForgotten    |
| `forgot-failed` | KeyForgotFailed |
| `flushing`      | StorageFlushing |
| `flushed`       | StorageFlushed  |

### listen

Register an event listener for one or more storage events.

#### Parameters

- **events** - String or an object of strings containing the type and a callback function.
- **callback** - Function to be executed when the event is dispatched in case an event is passed as a string.

#### Example

```javascript
LocalStorage.listen('retrieving', (event) => {
    console.log(event);
});
```

In case you would like to register multiple events, you can pass an object containing the type and a callback function:

```javascript
LocalStorage.listen({
    'retrieving': (event) => {
        // ...
    },
    'hit': (event) => {
        // ...
    },
    'missed': (event) => {
        // ...
    },
    'writing': (event) => {
        // ...
    },
    'written': (event) => {
        // ...
    },
    'write-failed': (event) => {
        // ...
    },
    'forgot': (event) => {
        // ...
    },
    'forgot-failed': (event) => {
        // ...
    },
    'flushing': (event) => {
        // ...
    },
    'flushed': (event) => {
        // ...
    },
});
```

Conveniently, you can also use the following methods to register event listeners for a specific event:

### onRetrieving

Triggered when a key is about to be retrieved from storage.

```javascript
LocalStorage.onRetrieving((event) => {
  // ...
});
```

### onHit

Triggered when a requested key is found in the storage.

```javascript
LocalStorage.onHit((event) => {
  // ...
});
```

### onMissed

Triggered when a requested key is not found in the storage.

```javascript
LocalStorage.onMissed((event) => {
  // ...
});
```

### onWriting

Triggered when a key is about to be written to storage.

```javascript
LocalStorage.onWriting((event) => {
  // ...
});
```

### onWritten

Triggered after a key has been successfully written to storage.

```javascript
LocalStorage.onWritten((event) => {
  // ...
});
```

### onWriteFailed

Triggered when writing a key to storage fails.

```javascript
LocalStorage.onWriteFailed((event) => {
  // ...
});
```

### onForgot

Triggered when a key is successfully removed from storage.

```javascript
LocalStorage.onForgot((event) => {
  // ...
});
```

### onForgotFailed

Triggered when removing a key from storage fails.

```javascript
LocalStorage.onForgotFailed((event) => {
  // ...
});
```

### onFlushing

Triggered when the storage is about to be cleared.

```javascript
LocalStorage.onFlushing((event) => {
  // ...
});
```

### onFlushed

Triggered after the storage has been successfully cleared.

```javascript
LocalStorage.onFlushed((event) => {
    // ...
});
```
