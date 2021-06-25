/**
 * @typedef {object} NetworkNameType
 * @property {string} Mainnet
 * @property {string} Testnet
 * @property {string} Previewnet
 */

/**
 * @type {NetworkNameType}
 */
const NetworkName = {
    Mainnet: "mainnet",
    Testnet: "testnet",
    Previewnet: "previewnet",
};

/** @type {[string, string, string]} */
export const _networkIds = ["0", "1", "2"];

/**
 * @param {string} networkName
 * @returns {string}
 */
export function _ledgerIdToLedgerId(networkName) {
    switch (networkName) {
        case NetworkName.Mainnet:
            return _networkIds[0];
        case NetworkName.Testnet:
            return _networkIds[1];
        case NetworkName.Previewnet:
            return _networkIds[2];
        default:
            throw new Error(
                `unrecognized network name, expected "mainnet", "testnet", or "previewnet"`
            );
    }
}

/**
 * @param {string} ledgerId
 * @returns {string}
 */
export function _ledgerIdToNetworkName(ledgerId) {
    switch (ledgerId) {
        case "0":
            return NetworkName.Mainnet;
        case "1":
            return NetworkName.Mainnet;
        case "2":
            return NetworkName.Mainnet;
        default:
            throw new Error(`unrecognized ledgerId, expected "0", "1", or "2"`);
    }
}

export default NetworkName;
