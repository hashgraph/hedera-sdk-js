/**
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./channel/Channel.js").default} Channel
 * @typedef {import("./channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("./address_book/NodeAddress.js").default} NodeAddress
 */

/**
 * @abstract
 * @template {Channel | MirrorChannel} ChannelT
 */
export default class ManagedNode {
    /**
     * @param {string} address
     * @param {(address: string, certHash?: Uint8Array) => ChannelT} channelInitFunction
     */
    constructor(address, channelInitFunction) {
        this.address = address;

        /** @type {Uint8Array=} */
        this.certHash = undefined;

        /** @type {ChannelT | null} */
        this._channel = null;

        /** @type {(address: string, certHash?: Uint8Array) => ChannelT} */
        this._channelInitFunction = channelInitFunction;
    }

    get channel() {
        if (this._channel != null) {
            return this._channel;
        }

        this._channel = this._channelInitFunction(this.address, this.certHash);

        return this._channel;
    }

    close() {
        if (this._channel != null) {
            this._channel.close();
        }

        this._channel = null;
    }
}
