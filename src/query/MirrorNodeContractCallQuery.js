import MirrorNodeContractQuery from "./MirrorNodeContractQuery.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
export default class MirrorNodeContractCallQuery extends MirrorNodeContractQuery {
    /**
     * @param {Client} client
     * @returns {Promise<string>}
     */
    async execute(client) {
        if (this.callData == null) {
            throw new Error("Call data is required.");
        }

        const JSON_PAYLOAD = {
            data: Buffer.from(this.callData).toString("hex"),
            to: this.contractEvmAddress,
            estimate: false,
        };

        /**
         * @type { { data: { result: string } } }
         */
        const mirrorNodeRequest = await this.performMirrorNodeRequest(
            client,
            JSON_PAYLOAD,
        );
        return mirrorNodeRequest.data.result;
    }
}
