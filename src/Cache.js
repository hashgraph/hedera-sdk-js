/**
 * @typedef {import("./contract/ContractId.js").default} ContractId
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./KeyList.js").default} KeyList
 * @typedef {import("./PublicKey.js").default} PublicKey
 * @typedef {import("./PrivateKey.js").default} PrivateKey
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

const CACHE = {
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
};

export default CACHE;
