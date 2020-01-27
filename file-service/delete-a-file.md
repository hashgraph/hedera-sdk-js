# Delete a file

`FileDeleteTransaction()` deletes a file stored on the Hedera network. Once the file has been deleted, it will be marked as deleted until it expires and will not retain any of its contents.

| Constructor | Description |
| :--- | :--- |
| `FileDeleteTransaction()` | Initializes the FileDeleteTransaction object |

```java
new FileDeleteTransaction()
     .setFileId()
     .execute();

```

| Method | Type | Description |
| :--- | :--- | :--- |
| `setFileId(<fileId>)` | FileId | The ID of the file to delete |

## Example

```java

```

