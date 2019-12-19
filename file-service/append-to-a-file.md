# Append to a file

`FileAppendTransaction()` appends content to the end of an existing file.

| Constructor | Description |
| :--- | :--- |
| `FileAppendTransaction()` | Initializes the FileAppendTransaction object |

```java
new FileAppendTransaction()
     .setFileId()
     .setContents()
     .Build;
```

| Method | Type | Description |
| :--- | :--- | :--- |
| `setFileId(<fileId>)` | FileId | The `fileId` of the file to append content to |
| `setContents(<content>)` | byte\[ \] | The appended content in byte format |

## Example

