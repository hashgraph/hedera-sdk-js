import Long from "long";
import MirrorNodeContractQuery from "./MirrorNodeContractQuery.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */
export default class MirrorNodeContractCallQuery extends MirrorNodeContractQuery {
    /**
     * @returns {Promise<Long>}
     */
    async execute() {
        if (this.callData == null) {
            throw new Error("Call data is required.");
        }

        const JSON_PAYLOAD = {
            data: Buffer.from(this.callData).toString("hex"),
            from: this.senderEvmAddress,
            to: this.contractEvmAddress,
            estimate: true,
            value: this.value,
        };

        /**
         * @type {{data: {result: string}}}
         */
        const mirrorNodeRequest = await this.performMirrorNodeRequest(
            "contracts/call",
            JSON.stringify(JSON_PAYLOAD),
        );

        console.log(Number(mirrorNodeRequest.data.result));
        return Long.fromNumber(Number(mirrorNodeRequest.data.result));
    }
}
