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
         * @type {?proto.CryptoService}
         * @private
         */
        this._crypto = null;
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
}
