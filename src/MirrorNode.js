import ManagedNode from "./ManagedNode.js";

/**
 * @typedef {import("./channel/MirrorChannel.js").default} MirrorChannel
 */

/**
 * @template {MirrorChannel} MirrorChannelT
 * @augments {ManagedNode<MirrorChannelT>}
 */
export default class Node extends ManagedNode {
    /**
     * @param {string} address
     * @param {(address: string) => MirrorChannelT} channelInitFunction
     */
    constructor(address, channelInitFunction) {
        super(address, channelInitFunction);
    }
}
