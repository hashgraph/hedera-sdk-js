import Long from "long";
import MirrorNodeContractQuery from "./MirrorNodeContractQuery.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
export default class MirrorNodeContractCallQuery extends MirrorNodeContractQuery {
    /**
     * @param {Client} client
     * @returns {Promise<Long>}
     */
    async execute(client) {
        if (this.callData == null) {
            throw new Error("Call data is required.");
        }

        const JSON_PAYLOAD = {
            data: Buffer.from(this.callData).toString("hex"),
            from: this.senderEvmAddress,
            to: this.contractEvmAddress,
            estimate: true,
        };

        /**
         * @type {{data: {result: string}}}
         */
        const mirrorNodeRequest = await this.performMirrorNodeRequest(
            client,
            JSON_PAYLOAD,
        );
        return Long.fromNumber(Number(mirrorNodeRequest.data.result));
    }
}
