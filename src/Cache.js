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
const CACHE = {
    /** @type {number} */
    timeDrift: 0,

    /** @type {FromProtobufKeyFuncT<HashgraphProto.proto.IContractID, ContractId> | null} */
    contractId: null,

    /** @type {FromProtobufKeyFuncT<HashgraphProto.proto.IKeyList, KeyList> | null} */
    keyList: null,

    /** @type {FromProtobufKeyFuncT<HashgraphProto.proto.IThresholdKey, KeyList> | null} */
    thresholdKey: null,

    /** @type {FromProtobufKeyFuncT<Uint8Array, PublicKey> | null} */
    publicKeyED25519: null,

    /** @type {FromProtobufKeyFuncT<Uint8Array, PublicKey> | null} */
    publicKeyECDSA: null,

    /** @type {((key: cryptography.PrivateKey) => PrivateKey) | null} */
    privateKeyConstructor: null,

    /** @type {((shard: Long | number, realm: Long | number, key: PublicKey) => AccountId) | null} */
    accountIdConstructor: null,

    /** @type {FromProtobufKeyFuncT<HashgraphProto.proto.IContractID, ContractId> | null} */
    delegateContractId: null,

    /** @type {FromProtobufKeyFuncT<Uint8Array, EvmAddress> | null} */
    evmAddress: null,

    /** @type {((bytes: Uint8Array) => EthereumTransactionData) | null} */
    ethereumTransactionDataLegacyFromBytes: null,

    /** @type {((bytes: Uint8Array) => EthereumTransactionData) | null} */
    ethereumTransactionDataEip1559FromBytes: null,
};

export default CACHE;
