import { root } from "./generated/proto.js";
// import { PublicKey } from "@hashgraph/cryptography";

/**
 * @typedef {object} GetHeader
 * @property {function(): root.proto.ResponseHeader | undefined} getHeader
 */

/**
 * @template T
 * @param {T | undefined} val
 * @param {string} msg
 * @returns {T}
 */
export function orThrow(val, msg = "value must not be null") {
    return reqDefined(val, msg);
}

/**
 * @param {number} seconds
 * @returns {root.proto.Duration}
 */
export function newDuration(seconds) {
    if (!Number.isSafeInteger(seconds)) {
        throw new TypeError("duration cannot have fractional seconds");
    }

    const duration = new root.proto.Duration();
    duration.setSeconds(seconds);
    return duration;
}

/**
 * @param {string} kind
 * @param {any} entityId
 * @returns {{shard?: number; realm?: number; entity: number}}
 */
export function normalizeEntityId(kind, entityId) {
    switch (typeof entityId) {
        case "object":
            if (entityId[kind] == null) {
                break;
            }

            return {
                // defaults overwritten if they exist in `entityId`
                shard: 0,
                realm: 0,
                entity: entityId[kind],
            };
        case "string": {
            const components = entityId.split(".");

            if (components.length === 1) {
                const id = { [kind]: Number(components[0]) };
                return normalizeEntityId(kind, id);
            } else if (components.length === 3) {
                return {
                    shard: Number(components[0]),
                    realm: Number(components[1]),
                    entity: Number(components[2]),
                };
            }

            break;
        }
        case "number": {
            if (!Number.isInteger(entityId) || entityId < 0) {
                break;
            } else if (!Number.isSafeInteger(entityId)) {
                // this isn't really a `TypeError` as we already checked that it is a `number`
                // eslint-disable-next-line unicorn/prefer-type-error
                throw new Error(
                    `${kind} ID outside safe integer range for number: ${entityId}`
                );
            }

            return normalizeEntityId(kind, { entity: entityId });
        }
        default:
    }

    throw new Error(`invalid ${kind} ID: ${entityId}`);
}

// /**
//  * @param {root.proto.KeyList} keylist
//  * @returns {PublicKey[]}
//  */
// export function getSdkKeys(keylist) {
//     return keylist
//         .getKeysList()
//         .map((key) => PublicKey.fromBytes(key.getEd25519_asU8()));
// }
// 
// /**
//  * @param {number} timeoutMs
//  * @returns {Promise<null>}
//  */
// export function setTimeoutAwaitable(timeoutMs) {
//     return new Promise((resolve) => setTimeout(resolve, timeoutMs));
// }
// 
// /**
//  * @template T
//  * @param {number} ms
//  * @param {Promise<T>} promise
//  * @param {(reject: (reason: Error) => void) => void} timedOutCallback
//  * @returns {Promise<T>}
//  */
// export function timeoutPromise(ms, promise, timedOutCallback) {
//     const timeout = new Promise((_, reject) => {
//         setTimeout(() => {
//             timedOutCallback(reject);
//         }, ms);
//     });
// 
//     return Promise.race([promise, timeout]);
// }

/**
 * @template T
 * @param {T | undefined} val
 * @param {string} msg
 * @returns {T}
 */
export function reqDefined(val, msg) {
    if (val == null) {
        throw new Error(msg);
    }

    return val;
}

/**
 * @param {root.proto.Response} response
 * @returns {root.proto.ResponseHeader}
 */
export function getResponseHeader(response) {
    switch (response.getroot.proto.ResponseCase()) {
        case root.proto.Response.root.proto.ResponseCase.RESPONSE_NOT_SET:
            throw new Error(
                `expected body for query response: ${response.toString()}`
            );
        case root.proto.Response.root.proto.ResponseCase.GETBYKEY:
            return response.getGetbykey().getHeader();
        case root.proto.Response.root.proto.ResponseCase.GETBYSOLIDITYID:
            return response.getGetbysolidityid().getHeader();
        case root.proto.Response.root.proto.ResponseCase.CONTRACTCALLLOCAL:
            return response.getContractcalllocal().getHeader();
        case root.proto.Response.root.proto.ResponseCase
            .CONTRACTGETBYTECODERESPONSE:
            return response.getContractgetbytecoderesponse().getHeader();
        case root.proto.Response.root.proto.ResponseCase.CONTRACTGETINFO:
            return response.getContractgetinfo().getHeader();
        case root.proto.Response.root.proto.ResponseCase
            .CONTRACTGETRECORDSRESPONSE:
            return response.getContractgetrecordsresponse().getHeader();
        case root.proto.Response.root.proto.ResponseCase
            .CRYPTOGETACCOUNTBALANCE:
            return response.getCryptogetaccountbalance().getHeader();
        case root.proto.Response.root.proto.ResponseCase
            .CRYPTOGETACCOUNTRECORDS:
            return response.getCryptogetaccountrecords().getHeader();
        case root.proto.Response.root.proto.ResponseCase.CRYPTOGETINFO:
            return response.getCryptogetinfo().getHeader();
        case root.proto.Response.root.proto.ResponseCase.CRYPTOGETPROXYSTAKERS:
            return response.getCryptogetproxystakers().getHeader();
        case root.proto.Response.root.proto.ResponseCase.FILEGETCONTENTS:
            return response.getFilegetcontents().getHeader();
        case root.proto.Response.root.proto.ResponseCase.FILEGETINFO:
            return response.getFilegetinfo().getHeader();
        case root.proto.Response.root.proto.ResponseCase.TRANSACTIONGETRECEIPT:
            return response.getTransactiongetreceipt().getHeader();
        case root.proto.Response.root.proto.ResponseCase.TRANSACTIONGETRECORD:
            return response.getTransactiongetrecord().getHeader();
        case root.proto.Response.root.proto.ResponseCase
            .TRANSACTIONGETFASTRECORD:
            return response.getTransactiongetfastrecord().getHeader();
        default:
            throw new Error(
                `unsupported response case ${response.getroot.proto.ResponseCase()}`
            );
    }
}
