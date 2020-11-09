/**
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./channel/Channel.js").default} Channel
 * @typedef {import("./channel/MirrorChannel.js").default} MirrorChannel
 */

/**
 * @abstract
 * @template {Channel | MirrorChannel} ChannelT
 */
export default class ManagedNode {
    /**
     * @param {string} address
     * @param {(address: string) => ChannelT} channelInitFunction
     */
    constructor(address, channelInitFunction) {
        this.address = address;

        /** @type {ChannelT | null} */
        this._channel = null;

        /** @type {(address: string) => ChannelT} */
        this._channelInitFunction = channelInitFunction;
    }

    get channel() {
        if (this._channel != null) {
            return this._channel;
        }

        this._channel = this._channelInitFunction(this.address);

        return this._channel;
    }

    close() {
        if (this._channel != null) {
            this._channel.close();
        }

        this._channel = null;
    }
}
