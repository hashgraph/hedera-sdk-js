/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

/**
 * @typedef {import("./contract/ContractId.js").default} ContractId
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./KeyList.js").default} KeyList
 * @typedef {import("./PublicKey.js").default} PublicKey
 * @typedef {import("./PrivateKey.js").default} PrivateKey
 * @typedef {import("./EvmAddress.js").default} EvmAddress
 * @typedef {import("./EthereumTransactionData.js").default} EthereumTransactionData
 * @typedef {import("./transaction/TransactionReceiptQuery.js").default} TransactionReceiptQuery
 * @typedef {import("./transaction/TransactionRecordQuery.js").default} TransactionRecordQuery
 * @typedef {import("./network/AddressBookQuery.js").default} AddressBookQuery
 */

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HashgraphProto.proto.IKey
 * @typedef {import("@hashgraph/proto").proto.IKeyList} HashgraphProto.proto.IKeyList
 * @typedef {import("@hashgraph/proto").proto.IThresholdKey} HashgraphProto.proto.IThresholdKey
 * @typedef {import("@hashgraph/proto").proto.IContractID} HashgraphProto.proto.IContractID
 */

/**
 * @namespace cryptography
 * @typedef {import("@hashgraph/cryptography").PrivateKey} cryptography.PrivateKey
 */

/**
 * @template {object} ProtobufT
 * @template {object} SdkT
 * @typedef {{ (proto: ProtobufT): SdkT }} FromProtobufKeyFuncT
 */

/**
 * This variable is strictly designed to prevent cyclic dependencies.
 */
class Cache {
    constructor() {
        /** @type {number} */
        this._timeDrift = 0;

        /** @type {FromProtobufKeyFuncT<HashgraphProto.proto.IContractID, ContractId> | null} */
        this._contractId = null;

        /** @type {FromProtobufKeyFuncT<HashgraphProto.proto.IKeyList, KeyList> | null} */
        this._keyList = null;

        /** @type {FromProtobufKeyFuncT<HashgraphProto.proto.IThresholdKey, KeyList> | null} */
        this._thresholdKey = null;

        /** @type {FromProtobufKeyFuncT<Uint8Array, PublicKey> | null} */
        this._publicKeyED25519 = null;

        /** @type {FromProtobufKeyFuncT<Uint8Array, PublicKey> | null} */
        this._publicKeyECDSA = null;

        /** @type {((key: cryptography.PrivateKey) => PrivateKey) | null} */
        this._privateKeyConstructor = null;

        /** @type {((shard: Long | number, realm: Long | number, key: PublicKey) => AccountId) | null} */
        this._accountIdConstructor = null;

        /** @type {FromProtobufKeyFuncT<HashgraphProto.proto.IContractID, ContractId> | null} */
        this._delegateContractId = null;

        /** @type {FromProtobufKeyFuncT<Uint8Array, EvmAddress> | null} */
        this._evmAddress = null;

        /** @type {((bytes: Uint8Array) => EthereumTransactionData) | null} */
        this._ethereumTransactionDataLegacyFromBytes = null;

        /** @type {((bytes: Uint8Array) => EthereumTransactionData) | null} */
        this._ethereumTransactionDataEip1559FromBytes = null;

        /** @type {(() => TransactionReceiptQuery) | null} */
        this._transactionReceiptQueryConstructor = null;

        /** @type {(() => TransactionRecordQuery) | null} */
        this._transactionRecordQueryConstructor = null;
    }

    /**
     * @param {number} timeDrift
     */
    setTimeDrift(timeDrift) {
        this._timeDrift = timeDrift;
    }

    /**
     * @returns {number}
     */
    get timeDrift() {
        if (this._timeDrift == null) {
            throw new Error("Cache.timeDrift was used before it was set");
        }

        return this._timeDrift;
    }

    /**
     * @param {FromProtobufKeyFuncT<HashgraphProto.proto.IContractID, ContractId>} contractId
     */
    setContractId(contractId) {
        this._contractId = contractId;
    }

    /**
     * @returns {FromProtobufKeyFuncT<HashgraphProto.proto.IContractID, ContractId>}
     */
    get contractId() {
        if (this._contractId == null) {
            throw new Error("Cache.contractId was used before it was set");
        }

        return this._contractId;
    }

    /**
     * @param {FromProtobufKeyFuncT<HashgraphProto.proto.IKeyList, KeyList>} keyList
     */
    setKeyList(keyList) {
        this._keyList = keyList;
    }

    /**
     * @returns {FromProtobufKeyFuncT<HashgraphProto.proto.IKeyList, KeyList>}
     */
    get keyList() {
        if (this._keyList == null) {
            throw new Error("Cache.keyList was used before it was set");
        }

        return this._keyList;
    }

    /**
     * @param {FromProtobufKeyFuncT<HashgraphProto.proto.IThresholdKey, KeyList>} thresholdKey
     */
    setThresholdKey(thresholdKey) {
        this._thresholdKey = thresholdKey;
    }

    /**
     * @returns {FromProtobufKeyFuncT<HashgraphProto.proto.IThresholdKey, KeyList>}
     */
    get thresholdKey() {
        if (this._thresholdKey == null) {
            throw new Error("Cache.thresholdKey was used before it was set");
        }

        return this._thresholdKey;
    }

    /**
     * @param {FromProtobufKeyFuncT<Uint8Array, PublicKey>} publicKeyED25519
     */
    setPublicKeyED25519(publicKeyED25519) {
        this._publicKeyED25519 = publicKeyED25519;
    }

    /**
     * @returns {FromProtobufKeyFuncT<Uint8Array, PublicKey>}
     */
    get publicKeyED25519() {
        if (this._publicKeyED25519 == null) {
            throw new Error(
                "Cache.publicKeyED25519 was used before it was set"
            );
        }

        return this._publicKeyED25519;
    }

    /**
     * @param {FromProtobufKeyFuncT<Uint8Array, PublicKey>} publicKeyECDSA
     */
    setPublicKeyECDSA(publicKeyECDSA) {
        this._publicKeyECDSA = publicKeyECDSA;
    }

    /**
     * @returns {FromProtobufKeyFuncT<Uint8Array, PublicKey>}
     */
    get publicKeyECDSA() {
        if (this._publicKeyECDSA == null) {
            throw new Error("Cache.publicKeyECDSA was used before it was set");
        }

        return this._publicKeyECDSA;
    }

    /**
     * @param {((key: cryptography.PrivateKey) => PrivateKey)} privateKeyConstructor
     */
    setPrivateKeyConstructor(privateKeyConstructor) {
        this._privateKeyConstructor = privateKeyConstructor;
    }

    /**
     * @returns {((key: cryptography.PrivateKey) => PrivateKey)}
     */
    get privateKeyConstructor() {
        if (this._privateKeyConstructor == null) {
            throw new Error(
                "Cache.privateKeyConstructor was used before it was set"
            );
        }

        return this._privateKeyConstructor;
    }

    /**
     * @param {((shard: Long | number, realm: Long | number, key: PublicKey) => AccountId)} accountIdConstructor
     */
    setAccountIdConstructor(accountIdConstructor) {
        this._accountIdConstructor = accountIdConstructor;
    }

    /**
     * @returns {((shard: Long | number, realm: Long | number, key: PublicKey) => AccountId)}
     */
    get accountIdConstructor() {
        if (this._accountIdConstructor == null) {
            throw new Error(
                "Cache.accountIdConstructor was used before it was set"
            );
        }

        return this._accountIdConstructor;
    }

    /**
     * @param {FromProtobufKeyFuncT<HashgraphProto.proto.IContractID, ContractId>} delegateContractId
     */
    setDelegateContractId(delegateContractId) {
        this._delegateContractId = delegateContractId;
    }

    /**
     * @returns {FromProtobufKeyFuncT<HashgraphProto.proto.IContractID, ContractId>}
     */
    get delegateContractId() {
        if (this._delegateContractId == null) {
            throw new Error(
                "Cache.delegateContractId was used before it was set"
            );
        }

        return this._delegateContractId;
    }

    /**
     * @param {FromProtobufKeyFuncT<Uint8Array, EvmAddress>} evmAddress
     */
    setEvmAddress(evmAddress) {
        this._evmAddress = evmAddress;
    }

    /**
     * @returns {FromProtobufKeyFuncT<Uint8Array, EvmAddress>}
     */
    get evmAddress() {
        if (this._evmAddress == null) {
            throw new Error("Cache.evmAddress was used before it was set");
        }

        return this._evmAddress;
    }

    /**
     * @param {((bytes: Uint8Array) => EthereumTransactionData)} ethereumTransactionDataLegacyFromBytes
     */
    setEthereumTransactionDataLegacyFromBytes(
        ethereumTransactionDataLegacyFromBytes
    ) {
        this._ethereumTransactionDataLegacyFromBytes =
            ethereumTransactionDataLegacyFromBytes;
    }

    /**
     * @returns {((bytes: Uint8Array) => EthereumTransactionData)}
     */
    get ethereumTransactionDataLegacyFromBytes() {
        if (this._ethereumTransactionDataLegacyFromBytes == null) {
            throw new Error(
                "Cache.ethereumTransactionDataLegacyFromBytes was used before it was set"
            );
        }

        return this._ethereumTransactionDataLegacyFromBytes;
    }

    /**
     * @param {((bytes: Uint8Array) => EthereumTransactionData)} ethereumTransactionDataEip1559FromBytes
     */
    setEthereumTransactionDataEip1559FromBytes(
        ethereumTransactionDataEip1559FromBytes
    ) {
        this._ethereumTransactionDataEip1559FromBytes =
            ethereumTransactionDataEip1559FromBytes;
    }

    /**
     * @returns {((bytes: Uint8Array) => EthereumTransactionData)}
     */
    get ethereumTransactionDataEip1559FromBytes() {
        if (this._ethereumTransactionDataEip1559FromBytes == null) {
            throw new Error(
                "Cache.ethereumTransactionDataEip1559FromBytes was used before it was set"
            );
        }

        return this._ethereumTransactionDataEip1559FromBytes;
    }

    /**
     * @param {(() => TransactionReceiptQuery)} transactionReceiptQueryConstructor
     */
    setTransactionReceiptQueryConstructor(transactionReceiptQueryConstructor) {
        this._transactionReceiptQueryConstructor =
            transactionReceiptQueryConstructor;
    }

    /**
     * @returns {(() => TransactionReceiptQuery)}
     */
    get transactionReceiptQueryConstructor() {
        if (this._transactionReceiptQueryConstructor == null) {
            throw new Error(
                "Cache.transactionReceiptQueryConstructor was used before it was set"
            );
        }

        return this._transactionReceiptQueryConstructor;
    }

    /**
     * @param {(() => TransactionRecordQuery)} transactionRecordQueryConstructor
     */
    setTransactionRecordQueryConstructor(transactionRecordQueryConstructor) {
        this._transactionRecordQueryConstructor =
            transactionRecordQueryConstructor;
    }

    /**
     * @returns {(() => TransactionRecordQuery)}
     */
    get transactionRecordQueryConstructor() {
        if (this._transactionRecordQueryConstructor == null) {
            throw new Error(
                "Cache.transactionRecordQueryConstructor was used before it was set"
            );
        }

        return this._transactionRecordQueryConstructor;
    }

    /**
     * @param {() => AddressBookQuery} addressBookQueryConstructor
     */
    setAddressBookQueryConstructor(addressBookQueryConstructor) {
        this._addressBookQueryConstructor = addressBookQueryConstructor;
    }

    /**
     * @returns {() => AddressBookQuery}
     */
    get addressBookQueryConstructor() {
        if (this._addressBookQueryConstructor == null) {
            throw new Error(
                "Cache.addressBookQueryConstructor was used before it was set"
            );
        }

        return this._addressBookQueryConstructor;
    }
}

const CACHE = new Cache();

export default CACHE;
