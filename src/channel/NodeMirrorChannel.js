import * as grpc from "@grpc/grpc-js";
import MirrorChannel from "./MirrorChannel.js";

/**
 * @internal
 */
export default class NodeMirrorChannel extends MirrorChannel {
    /**
     * @internal
     * @param {string} address
     */
    constructor(address) {
        super();

        /**
         * @type {grpc.Client}
         * @private
         */
        this._client = new grpc.Client(
            address,
            grpc.credentials.createInsecure()
        );
    }

    /**
     * @override
     * @returns {void}
     */
    close() {
        this._client.close();
    }

    /**
     * @override
     * @internal
     * @param {Uint8Array} requestData
     * @param {(error: number?, data: Uint8Array?) => void} callback
     * @returns {() => void}
     */
    makeServerStreamRequest(requestData, callback) {
        let stream = this._client
            .makeServerStreamRequest(
                // `/proto.ConsensusService/SubscribeTopic`,
                "/com.hedera.mirror.api.proto.ConsensusService/subscribeTopic",
                (value) => value,
                (value) => value,
                Buffer.from(requestData)
            )
            .on("data", (/** @type {Uint8Array} */ data) => {
                callback(null, data);
            })
            .on("status", (/** @type {grpc.StatusObject} */ status) => {
                callback(status.code, null);
            })
            .on("error", (/** @type {grpc.StatusObject} */ status) => {
                callback(status.code, null);
            });

        return () => {
            stream.cancel();
        };
    }
}
