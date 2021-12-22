


const DEFAULT_ERROR = "Default case reached for: ";

// const MAINNET = "mainnet";
// const TESTNET = "testnet";
// const PREVIEWNET = "previewnet";

export default class NetworkName { 
    /**
     * @hideconstructor
     * @internal
     * @param {number} networkId
     */
    constructor(networkId) {
        /** @readonly */
        this._networkId = networkId;

        /** @readonly */
        this._networkName = this.networkNameFromId(networkId);

        Object.freeze(this);
    }

    /**
     * @returns {number}
     */
    get networkId(){
        return this._networkId;
    }

    /**
     * @returns {string}
     */
    get networkName(){
        return this._networkName;
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.networkId.toString();
    }

    /**
     * @param {string} networkNameOrId
     * @returns {NetworkName}
     */
    static fromString(networkNameOrId){
        switch (networkNameOrId){
            case "0" || "mainnet":
                return NetworkName.Mainnet;
            case "1" || "testnet":
                return NetworkName.Testnet;
            case "2" || "previewnet":
                return NetworkName.Previewnet;
            default:
                throw new Error(DEFAULT_ERROR.concat("fromString"));
        }
    }

    // /**
    //  * @returns 
    //  */
    // _toProtobuf(){

    // }

    // /**
    //  * @internal
    //  * @param {proto.INetworkName} networkName
    //  * @returns {NetworkName}
    //  */
    // static _fromProtobuf(networkName){

    // }

    /**
     * @param {number} networkId
     * @returns {NetworkName}
     */
    static fromNetworkId(networkId){
        switch (networkId) {
            case 0:
                return NetworkName.Mainnet;
            case 1:
                return NetworkName.Testnet;
            case 2:
                return NetworkName.Previewnet;
            default:
                throw new Error(DEFAULT_ERROR.concat("fromNetworkId"));
        }
    }

    /**
     * @param {string} networkName
     * @returns {NetworkName}
     */
    static fromNetworkName(networkName){
        switch(networkName){
            case "mainnet":
                return NetworkName.Mainnet;
            case "testnet":
                return NetworkName.Testnet;
            case "previewnet":
                return NetworkName.Previewnet;
            default:
                throw new Error(DEFAULT_ERROR.concat("fromNetworkName"));
        }
    }

    /**
     * @param {string} networkName
     * @returns {number}
     */
    networkIdFromName(networkName){
        switch (networkName){
            case "mainnet":
                return 0;
            case "testnet":
                return 1;
            case "previewnet":
                return 2;
            default:
                throw new Error(DEFAULT_ERROR.concat("networkIdFromName"));
        }
    }

    /**
     * @param {number} networkId
     * @returns {string}
     */
    networkNameFromId(networkId) {
        switch (networkId) {
            case 0:
                return "mainnet";
            case 1:
                return "testnet";
            case 2:
                return "previewnet";
            default:
                throw new Error(DEFAULT_ERROR.concat("networkNameFromId"));
        }
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
