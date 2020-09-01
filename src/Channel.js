import { Client as NativeClient, credentials } from "@grpc/grpc-js";
import proto from "@hashgraph/proto";

export default class Channel {
    /**
     * @param {string} address
     */
    constructor(address) {
        /**
         * @type {NativeClient}
         * @private
         */
        this._client = new NativeClient(address, credentials.createInsecure());

        /**
         * @private
         * @type {?proto.CryptoService}
         */
        this._crypto = null;

        /**
         * @private
         * @type {?proto.SmartContractService}
         */
        this._smartContract = null;
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
}
