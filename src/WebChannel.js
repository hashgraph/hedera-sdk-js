import proto from "@hashgraph/proto";
import { grpc } from "@improbable-eng/grpc-web";
import AccountId from "./account/AccountId";

/**
 * @typedef {object} NetworkProxy
 * @property {string} url
 * @property {AccountId} accountId
 */

// /**
//  * @type {NetworkProxy}
//  */
// const MAINNET_PROXY = {
//     url: "https://grpc-web.myhbarwallet.com",
//     accountId: new AccountId(3),
// };

// /**
//  * @type {NetworkProxy}
//  */
// const TESTNET_PROXY = {
//     url: "https://grpc-web.testnet.myhbarwallet.com",
//     accountId: new AccountId(3),
// };

// /**
//  * @type {NetworkProxy}
//  */
// const PREVIEWNET_PROXY = {
//     url: "https://grpc-web.previewnet.myhbarwallet.com",
//     accountId: new AccountId(3),
// };

export default class Channel {
    /**
     * @param {NetworkProxy} proxy
     */
    constructor(proxy) {
        /**
         * @type {NetworkProxy}
         * @private
         */
        this._proxy = proxy;

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

        /**
         * @private
         * @type {?proto.FileService}
         */
        this._file = null;

        /**
         * @private
         * @type {?proto.ConsensusService}
         */
        this._consensus = null;
    }

    /**
     * @returns {proto.CryptoService}
     */
    get crypto() {
        if (this._crypto != null) {
            return this._crypto;
        }

        this._crypto = proto.CryptoService.create(
            (method, request, callback) => {
                if (typeof method === "function") {
                    throw new Error("");
                }

                grpc.unary({
                        methodName: method.name,
                        service: {
                            serviceName: `/proto.${proto.CryptoService.name}`,
                        },
                        requestType: method.requestType,
                        responseType: method.responseType,
                    }, {
                        host: this._proxy.url,
                        request,
                        onEnd(response) {
                            if (response.status === grpc.Code.OK && response.message != null) {
                                callback(null, response.message.serializeBinary());
                            } else {
                                callback(new Error(response.statusMessage), null);
                            }
                        }
                    });
            },
            false,
            false
        );

        return this._crypto;
    }

    // /**
    //  * @returns {proto.SmartContractService}
    //  */
    // get smartContract() {
    //     if (this._smartContract != null) {
    //         return this._smartContract;
    //     }

    //     this._smartContract = proto.SmartContractService.create(
    //         (method, requestData, callback) => {
    //             this._client.makeUnaryRequest(
    //                 `/proto.${proto.SmartContractService.name}/${method.name}`,
    //                 (value) => value,
    //                 (value) => value,
    //                 Buffer.from(requestData),
    //                 callback
    //             );
    //         },
    //         false,
    //         false
    //     );

    //     return this._smartContract;
    // }

    // /**
    //  * @returns {proto.FileService}
    //  */
    // get file() {
    //     if (this._file != null) {
    //         return this._file;
    //     }

    //     this._file = proto.FileService.create(
    //         (method, requestData, callback) => {
    //             this._client.makeUnaryRequest(
    //                 `/proto.${proto.FileService.name}/${method.name}`,
    //                 (value) => value,
    //                 (value) => value,
    //                 Buffer.from(requestData),
    //                 callback
    //             );
    //         },
    //         false,
    //         false
    //     );

    //     return this._file;
    // }

    // /**
    //  * @returns {proto.ConsensusService}
    //  */
    // get consensus() {
    //     if (this._consensus != null) {
    //         return this._consensus;
    //     }

    //     this._consensus = proto.ConsensusService.create(
    //         (method, requestData, callback) => {
    //             this._client.makeUnaryRequest(
    //                 `/proto.${proto.ConsensusService.name}/${method.name}`,
    //                 (value) => value,
    //                 (value) => value,
    //                 Buffer.from(requestData),
    //                 callback
    //             );
    //         },
    //         false,
    //         false
    //     );

    //     return this._consensus;
    // }

    // /**
    //  * @returns {proto.FreezeService}
    //  */
    // get freeze() {
    //     if (this._freeze != null) {
    //         return this._freeze;
    //     }

    //     this._freeze = proto.FreezeService.create(
    //         (method, requestData, callback) => {
    //             this._client.makeUnaryRequest(
    //                 `/proto.${proto.FreezeService.name}/${method.name}`,
    //                 (value) => value,
    //                 (value) => value,
    //                 Buffer.from(requestData),
    //                 callback
    //             );
    //         },
    //         false,
    //         false
    //     );

    //     return this._freeze;
    // }
}
