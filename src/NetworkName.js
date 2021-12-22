

export default class NetworkName {

    /**
     * @hideconstructor
     * @internal
     * @param {number} networkId
     */
    constructor(networkId) {
        /** @readonly */
        this._networkId = networkId;

        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {

    }





}


NetworkName.Mainnet = new NetworkName(0);

NetworkName.Testnet = new NetworkName(1);

NetworkName.Previewnet = new NetworkName(2);


















// /**
//  * @typedef {import("./client/Client.js").NetworkName} ClientNetworkName
//  */

// /**
//  * @typedef {object} NetworkNameType
//  * @property {ClientNetworkName} Mainnet
//  * @property {ClientNetworkName} Testnet
//  * @property {ClientNetworkName} Previewnet
//  */

// /**
//  * @type {NetworkNameType}
//  */
// const NetworkName = {
//     Mainnet: "mainnet",
//     Testnet: "testnet",
//     Previewnet: "previewnet",
// };

// /** @type {[string, string, string]} */
// export const _networkIds = ["0", "1", "2"];

// /**
//  * @param {string} networkName
//  * @returns {string}
//  */
// export function _ledgerIdToLedgerId(networkName) {
//     switch (networkName) {
//         case NetworkName.Mainnet:
//             return _networkIds[0];
//         case NetworkName.Testnet:
//             return _networkIds[1];
//         case NetworkName.Previewnet:
//             return _networkIds[2];
//         default:
//             throw new Error(
//                 `unrecognized network name, expected "mainnet", "testnet", or "previewnet"`
//             );
//     }
// }

// /**
//  * @param {string} ledgerId
//  * @returns {string}
//  */
// export function _ledgerIdToNetworkName(ledgerId) {
//     switch (ledgerId) {
//         case "0":
//             return NetworkName.Mainnet;
//         case "1":
//             return NetworkName.Testnet;
//         case "2":
//             return NetworkName.Previewnet;
//         default:
//             throw new Error(`unrecognized ledgerId, expected "0", "1", or "2"`);
//     }
// }

// export default NetworkName;
