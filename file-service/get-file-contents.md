# Get file contents

`FileContentsQuery()` returns the contents of a file. If the file is empty the content field is empty. The response returns the file ID and the file contents in bytes.

| Constructor | Description |
| :--- | :--- |
| `FileContentsQuery()` | Initializes a FileContentQuery object |

```javascript
new FileContentsQuery()
    .setAcountId()
    .execute();

```

| Method | Type | Description |
| :--- | :--- | :--- |
| `setAccountId(<account>)` | AccountID | The ID of the file to get contents from |

## Example

```javascript
hsh
```

