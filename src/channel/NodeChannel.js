import * as grpc from "@grpc/grpc-js";
import proto from "@hashgraph/proto";
import Channel from "./Channel";

export default class NodeChannel extends Channel {
    /**
     * @param {string} address
     */
    constructor(address) {
        super(address);

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
     * @returns {proto.CryptoService}
     */
    get crypto() {
        if (this._crypto != null) {
            return this._crypto;
        }

        this._crypto = proto.CryptoService.create(
            (method, requestData, callback) => {
                this._client.makeUnaryRequest(
                    `/proto.${proto.CryptoService.name}/${method.name}`,
                    (value) => value,
                    (value) => value,
                    Buffer.from(requestData),
                    callback
                );
            },
            false,
            false
        );

        return this._crypto;
    }

    /**
     * @returns {proto.SmartContractService}
     */
    get smartContract() {
        if (this._smartContract != null) {
            return this._smartContract;
        }

        this._smartContract = proto.SmartContractService.create(
            (method, requestData, callback) => {
                this._client.makeUnaryRequest(
                    `/proto.${proto.SmartContractService.name}/${method.name}`,
                    (value) => value,
                    (value) => value,
                    Buffer.from(requestData),
                    callback
                );
            },
            false,
            false
        );

        return this._smartContract;
    }

    /**
     * @returns {proto.FileService}
     */
    get file() {
        if (this._file != null) {
            return this._file;
        }

        this._file = proto.FileService.create(
            (method, requestData, callback) => {
                this._client.makeUnaryRequest(
                    `/proto.${proto.FileService.name}/${method.name}`,
                    (value) => value,
                    (value) => value,
                    Buffer.from(requestData),
                    callback
                );
            },
            false,
            false
        );

        return this._file;
    }

    /**
     * @returns {proto.ConsensusService}
     */
    get consensus() {
        if (this._consensus != null) {
            return this._consensus;
        }

        this._consensus = proto.ConsensusService.create(
            (method, requestData, callback) => {
                this._client.makeUnaryRequest(
                    `/proto.${proto.ConsensusService.name}/${method.name}`,
                    (value) => value,
                    (value) => value,
                    Buffer.from(requestData),
                    callback
                );
            },
            false,
            false
        );

        return this._consensus;
    }

    /**
     * @returns {proto.FreezeService}
     */
    get freeze() {
        if (this._freeze != null) {
            return this._freeze;
        }

        this._freeze = proto.FreezeService.create(
            (method, requestData, callback) => {
                this._client.makeUnaryRequest(
                    `/proto.${proto.FreezeService.name}/${method.name}`,
                    (value) => value,
                    (value) => value,
                    Buffer.from(requestData),
                    callback
                );
            },
            false,
            false
        );

        return this._freeze;
    }

    /**
     * @returns {proto.NetworkService}
     */
    get network() {
        if (this._network != null) {
            return this._network;
        }

        this._network = proto.NetworkService.create(
            (method, requestData, callback) => {
                this._client.makeUnaryRequest(
                    `/proto.${proto.NetworkService.name}/${method.name}`,
                    (value) => value,
                    (value) => value,
                    Buffer.from(requestData),
                    callback
                );
            },
            false,
            false
        );

        return this._network;
    }

    /**
     * Cannot make this a simple getter becasue the call within the `create()`
     * needs to save the request handle to `SubscriptionHandle`
     *
     * @param {import("../topic/SubscriptionHandle").default} handle
     * @returns {proto.MirrorConsensusService}
     */
    mirror(handle) {
        return proto.MirrorConsensusService.create(
            (method, requestData, callback) => {
                const request = this._client
                    .makeServerStreamRequest(
                        `/${proto.MirrorConsensusService.name}/${method.name}`,
                        (value) => value,
                        (value) => value,
                        Buffer.from(requestData)
                    )
                    .on("data", callback)
                    .on("status", (status) => {
                        // Only propagate the error if it is `NOT_FOUND` or `UNAVAILABLE`
                        // Otherwise finish here
                        if (
                            status.code === grpc.status.NOT_FOUND ||
                            status.code === grpc.status.UNAVAILABLE
                        ) {
                            callback(new Error(status.code.toString()));
                        }
                    });

                handle._setCall(() => request.cancel());
            }
        );
    }
}
