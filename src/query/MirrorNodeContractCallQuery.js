import MirrorNodeContractQuery from "./MirrorNodeContractQuery.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
export default class MirrorNodeContractCallQuery extends MirrorNodeContractQuery {
    /**
     * @returns {Promise<string>}
     */
    async execute() {
        if (this.callData == null) {
            throw new Error("Call data is required.");
        }

        const API_ENDPOINT = "contracts/call";
        const JSON_PAYLOAD = {
            data: Buffer.from(this.callData).toString("hex"),
            to: this.contractEvmAddress,
            estimate: false,
        };

        console.log(JSON_PAYLOAD);
        /**
         * @type { { data: { result: string } } }
         */
        const mirrorNodeRequest = await this.performMirrorNodeRequest(
            API_ENDPOINT,
            JSON.stringify(JSON_PAYLOAD),
        );
        //console.log(mirrorNodeRequest);
        /**
         * @type {object}
         */
        return mirrorNodeRequest.data.result;
    }
}
