# Specialized Data Types

## [AccountId](https://github.com/hashgraph/hedera-sdk-java/blob/master/src/main/java/com/hedera/hashgraph/sdk/account/AccountId.java)

An `AccountId` is composed of a &lt;shardNum&gt;.&lt;realmNum&gt;.&lt;accountNum&gt; \(eg. 0.0.10\).

* **shardNum** represents the shard number \(`shardId`\). It will default to 0 today, as Hedera only performs in one shard.
* **realmnNum** represents the realm number \(`realmId`\). It will default to 0 today, as realms are not yet supported.
* **accountNum** represents the account number

Together these values make up your `AccountId`. When an `AccountId` is requested, be sure all three values are included.

## Example <a id="example"></a>

```text

```

## [FileId](https://github.com/hashgraph/hedera-sdk-java/blob/master/src/main/java/com/hedera/hashgraph/sdk/file/FileId.java)

A `FileId` is composed of a &lt;shardNum&gt;.&lt;realmNum&gt;.&lt;fileNum&gt; \(eg. 0.0.15\).

* **shardNum** represents the shard number \(`shardId`\). It will default to 0 today, as Hedera only performs in one shard.
* **realmnNum** represents the realm number \(`realmId`\). It will default to 0 today, as realms are not yet supported.
* **fileNum** represents the file number

Together these values make up your accountId. When an `FileId` is requested, be sure all three values are included.

## Example <a id="example-1"></a>

```text
FileId fileId = new FileId(0,0,15);System.out.println(fileId);​FileId fileId = FileId.fromString("0.0.15");System.out.println(fileId);
```

## [ContractId](https://github.com/hashgraph/hedera-sdk-java/blob/master/src/main/java/com/hedera/hashgraph/sdk/contract/ContractId.java)

A `ContractId` is composed of a &lt;shardNum&gt;.&lt;realmNum&gt;.&lt;contractNum&gt; \(eg. 0.0.20\).

* **shardNum** represents the shard number \(`shardId`\). It will default to 0 today, as Hedera only performs in one shard.
* **realmnNum** represents the realm number \(`realmId`\). It will default to 0 today, as realms are not yet supported.
* **contractNum** represents the contract number

Together these values make up your `ContractId`. When an `ContractId` is requested, be sure all three values are included.

## Example <a id="example-2"></a>

```text
ContractId contractId = new ContractId(0,0,20);System.out.println(contractId);​ContractId contractId = ContractId.fromString("0.0.20");System.out.println(contractId);
```

