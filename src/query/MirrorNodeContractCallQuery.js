import MirrorNodeContractQuery from "./MirrorNodeContractQuery.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
export default class MirrorNodeContractCallQuery extends MirrorNodeContractQuery {
    /**
     * @returns {Object}
     */
    get JSONPayload() {
        if (this.callData == null) {
            throw new Error("Call data is required.");
        }

        return {
            data: Buffer.from(this.callData).toString("hex"),
            from: this.sender?.evmAddress,
            to: this.contractEvmAddress,
            estimate: false,
            gasPrice: this.gasPrice?.toString(),
            gas: this.gasLimit?.toString(),
            blockNumber: this.blockNumber?.toString(),
            value: this.value?.toString(),
        };
    }
}
