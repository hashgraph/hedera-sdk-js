import { Client, credentials } from "@grpc/grpc-js";

/**
 * @internal
 */
export default class MirrorChannel {
    /**
     * @internal
     * @param {string} address
     */
    constructor(address) {
        /**
         * @type {Client}
         * @private
         */
        this._client = new Client(address, credentials.createInsecure());
    }

    /**
     * @abstract
     * @returns {void}
     */
    close() {
        this._client.close();
    }

    /**
     * @override
     * @internal
     * @param {Uint8Array} requestData
     * @returns {import("@grpc/grpc-js").ClientReadableStream<Buffer>}
     */
    makeServerStreamRequest(requestData) {
        return this._client.makeServerStreamRequest(
            // `/proto.ConsensusService/SubscribeTopic`,
            "/com.hedera.mirror.api.proto.ConsensusService/subscribeTopic",
            (value) => value,
            (value) => value,
            Buffer.from(requestData)
        );
    }
}
