/**
 * @typedef {import("./contract/ContractId.js").default} ContractId
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./KeyList.js").default} KeyList
 * @typedef {import("./PublicKey.js").default} PublicKey
 * @typedef {import("./PrivateKey.js").default} PrivateKey
 */

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IKey} proto.IKey
 * @typedef {import("@hashgraph/proto").IKeyList} proto.IKeyList
 * @typedef {import("@hashgraph/proto").IThresholdKey} proto.IThresholdKey
 * @typedef {import("@hashgraph/proto").IContractID} proto.IContractID
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
    /** @type {FromProtobufKeyFuncT<proto.IContractID, ContractId> | null} */
    contractId: null,

    /** @type {FromProtobufKeyFuncT<proto.IKeyList, KeyList> | null} */
    keyList: null,

    /** @type {FromProtobufKeyFuncT<proto.IThresholdKey, KeyList> | null} */
    thresholdKey: null,

    /** @type {FromProtobufKeyFuncT<Uint8Array, PublicKey> | null} */
    publicKeyED25519: null,

    /** @type {FromProtobufKeyFuncT<Uint8Array, PublicKey> | null} */
    publicKeyECDSA: null,

    /** @type {((key: cryptography.PrivateKey) => PrivateKey) | null} */
    privateKeyConstructor: null,

    /** @type {((shard: Long | number, realm: Long | number, key: PublicKey) => AccountId) | null} */
    accountIdConstructor: null,

    /** @type {FromProtobufKeyFuncT<proto.IContractID, ContractId> | null} */
    delegateContractId: null,
};

export default CACHE;
