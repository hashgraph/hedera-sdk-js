# Specialized Data Types

## [AccountId](https://github.com/hashgraph/hedera-sdk-java/blob/master/src/main/java/com/hedera/hashgraph/sdk/account/AccountId.java)

An `AccountId` is composed of a &lt;shardNum&gt;.&lt;realmNum&gt;.&lt;accountNum&gt; \(eg. 0.0.10\).

* **shardNum** represents the shard number \(`shardId`\). It will default to 0 today, as Hedera only performs in one shard.
* **realmNum** represents the realm number \(`realmId`\). It will default to 0 today, as realms are not yet supported.
* **accountNum** represents the account number \(`accountId`\)

Together these values make up your `AccountId`. When an `AccountId` is requested, be sure all three values are included.

| Constructor | Type | Description |
| :--- | :---: | :--- |
| `AccountId(<accountNum>)` | number | Constructs an `AccountId` with 0 for `shardNum` and `realmNum` \(e.g., `0.0.<accountNum>`\) |

```javascript
new AccountId(); 
```

| Method | Type | Description |
| :--- | :--- | :--- |
| `AccountId.fromString(<account>)` | String | Constructs an `AccountId` from a string formatted as `<shardNum>`.`<realmNum>`.`<accountNum>` or can take `<accountNum>` alone and use `0` as defaults for `<shardNum>` and `<realmNum>` |

### Example

```javascript
const acctId = new AccountId(100);
console.log(`${acctId}`);

// Construct accountId from String
const acctId = AccountId.fromString(`100`);
console.log(`${acctId}`);

```

## [FileId](https://github.com/hashgraph/hedera-sdk-java/blob/master/src/main/java/com/hedera/hashgraph/sdk/file/FileId.java)

A `FileId` is composed of a &lt;shardNum&gt;.&lt;realmNum&gt;.&lt;fileNum&gt; \(eg. 0.0.15\).

* **shardNum** represents the shard number \(`shardId`\). It will default to 0 today, as Hedera only performs in one shard.
* **realmNum** represents the realm number \(`realmId`\). It will default to 0 today, as realms are not yet supported.
* **fileNum** represents the file number

Together these values make up your accountId. When an `FileId` is requested, be sure all three values are included.

| Constructor | Type | Description |
| :--- | :---: | :--- |
| `FileId(<fileNum>)` | number | Constructs an `FileId` with 0 for `shardNum` and `realmNum` \(e.g., `0.0.<fileNum>`\) |

```java
new FileId();
```

<table>
  <thead>
    <tr>
      <th style="text-align:left">Method</th>
      <th style="text-align:left">Type</th>
      <th style="text-align:left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left"><code>FileId.fromString()</code>
      </td>
      <td style="text-align:left">String</td>
      <td style="text-align:left">
        <p>Constructs an <code>FileId</code> from a string formatted as</p>
        <p><code>&lt;shardNum&gt;</code>,<code>&lt;realmNum&gt;,&lt;fileNum&gt;</code> or
          can take <code>&lt;fileNum&gt;</code> alone and use <code>0</code> as defaults
          for <code>&lt;shardNum&gt;</code> and <code>&lt;realmNum&gt;</code>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left"><b><code>FileId.fromSolidityAddress()</code></b>
      </td>
      <td style="text-align:left">String</td>
      <td style="text-align:left">Constructs an <code>FileId</code> from a solidity address in string format</td>
    </tr>
    <tr>
      <td style="text-align:left"><code>FileId.ADDRESS_BOOK</code>
      </td>
      <td style="text-align:left">FileId</td>
      <td style="text-align:left">The public node address book for the current network</td>
    </tr>
    <tr>
      <td style="text-align:left"><code>FileId.EXCHANGE_RATES</code>
      </td>
      <td style="text-align:left">FileId</td>
      <td style="text-align:left">The current exchange rate of HBAR to USD</td>
    </tr>
    <tr>
      <td style="text-align:left"><code>FileId.FEE_SCHEDULE</code>
      </td>
      <td style="text-align:left">FileId</td>
      <td style="text-align:left">The current fee schedule for the network</td>
    </tr>
  </tbody>
</table>### Example

```javascript
const newFileId = new FileId(100);
console.log(`${newFileId}`);

//Construct a fileId from a String
const newFileIdFromString = FileId.fromString(`100`); 
console.log(`${newFileIdFromString}`);
```

## [ContractId](https://github.com/hashgraph/hedera-sdk-java/blob/master/src/main/java/com/hedera/hashgraph/sdk/contract/ContractId.java)

A `ContractId` is composed of a &lt;shardNum&gt;.&lt;realmNum&gt;.&lt;contractNum&gt; \(eg. 0.0.20\).

* **shardNum** represents the shard number \(`shardId`\). It will default to 0 today, as Hedera only performs in one shard.
* **realmNum** represents the realm number \(`realmId`\). It will default to 0 today, as realms are not yet supported.
* **contractNum** represents the contract number

Together these values make up your `ContractId`. When an `ContractId` is requested, be sure all three values are included.

| Constructor | Type | Description |
| :--- | :--- | :--- |
| `ContractId(<contractNum>)` | number | Constructs a `ContractId` with 0 for `shardNum` and `realmNum` \(e.g., `0.0.<contractNum>`\) |

```java
new ContractId(); 
```

<table>
  <thead>
    <tr>
      <th style="text-align:left">Method</th>
      <th style="text-align:left">Type</th>
      <th style="text-align:left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left"><code>ContractId.fromString()</code>
      </td>
      <td style="text-align:left">String</td>
      <td style="text-align:left">
        <p>Constructs a <code>ContractId </code>from a string formatted as</p>
        <p><code>&lt;shardNum&gt;</code>, <code>&lt;realmNum&gt;</code>, <code>&lt;contractNum&gt;</code>or
          can take <code>&lt;contractNum&gt;</code> alone and use <code>0</code> as defaults
          for <code>&lt;shardNum&gt;</code> and <code>&lt;realmNum&gt;</code>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left"><b><code>ContractId.fromSolidityAddress(&lt;address&gt;)</code></b>
      </td>
      <td style="text-align:left">String</td>
      <td style="text-align:left">Constructs a <code>ContractId</code> from a solidity address in string format</td>
    </tr>
  </tbody>
</table>### Example

```java
const newContractId = new ContractId(100);
console.log(`${newContractId}`);

// Construct a contractId from a String
const newContractId = ContractId.fromString(`100`); 
console.log(`${newContractId}`);
```

## [TransactionId](https://github.com/hashgraph/hedera-sdk-java/blob/master/src/main/java/com/hedera/hashgraph/sdk/TransactionId.java)

A `TransactionId` is composed of the current time and account that is primarily signing the transaction. Every transaction has an assciated `TransactionId`. The `TransactionId` should never be set by a user unless in very special circumstances.

| Constructor | Type | Description |
| :--- | :--- | :--- |
| `TransactionId(<accountId>)` | AccountId | Generates a new transaction ID for the given `accountId`. |

```javascript
new TransactionId()
```

### Example

```java
const txId = new TransactionId(newAccountId);
console.log(`${txId}`);
```

#### Response

```bash
0.0.100@1577703185.262000000
```



