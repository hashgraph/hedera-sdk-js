import ManagedNode from "./ManagedNode.js";

/**
 * @typedef {import("./channel/MirrorChannel.js").default} MirrorChannel
 * @typedef {import("./ManagedNodeAddress.js").default} ManagedNodeAddress
 */

/**
 * @template {MirrorChannel} ChannelT
 * @typedef {object} NewNode
 * @property {string} address
 * @property {(address: string, cert?: string) => ChannelT} channelInitFunction
 */

/**
 * @template {MirrorChannel} ChannelT
 * @typedef {object} CloneNode
 * @property {MirrorNode<ChannelT>} node
 * @property {ManagedNodeAddress} address
 */

/**
 * @template {MirrorChannel} ChannelT
 * @augments {ManagedNode<ChannelT>}
 */
export default class MirrorNode extends ManagedNode {
    /**
     * @param {object} props
     * @param {NewNode<ChannelT>=} [props.newNode]
     * @param {CloneNode<ChannelT>=} [props.cloneNode]
     */
    constructor(props = {}) {
        super(props);
    }

    /**
     * @returns {MirrorNode<ChannelT>}
     */
    toInsecure() {
        return new MirrorNode({
            cloneNode: { node: this, address: this._address.toInsecure() },
        });
    }

    /**
     * @returns {MirrorNode<ChannelT>}
     */
    toSecure() {
        return new MirrorNode({
            cloneNode: { node: this, address: this._address.toSecure() },
        });
    }
}
