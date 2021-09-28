import { Client, credentials } from "@grpc/grpc-js";
import Channel from "./Channel.js";
import GrpcServicesError from "../grpc/GrpcServiceError.js";
import GrpcStatus from "../grpc/GrpcStatus.js";

/**
 * @property {?proto.CryptoService} _crypto
 * @property {?proto.SmartContractService} _smartContract
 * @property {?proto.FileService} _file
 * @property {?proto.FreezeService} _freeze
 * @property {?proto.ConsensusService} _consensus
 * @property {?proto.NetworkService} _network
 */
export default class NodeChannel extends Channel {
    /**
     * @internal
     * @param {string} address
     * @param {string=} cert
     */
    constructor(address, cert) {
        super();

        this.cert = cert;

        let security;
        let options;

        if (this.cert != null) {
            security = credentials.createSsl(Buffer.from(this.cert));
            options = {
                "grpc.ssl_target_name_override": "127.0.0.1",
                "grpc.default_authority": "127.0.0.1",
                "grpc.http_connect_creds": "0",
                // https://github.com/grpc/grpc-node/issues/1593
                // https://github.com/grpc/grpc-node/issues/1545
                // https://github.com/grpc/grpc/issues/13163
                "grpc.keepalive_timeout_ms": 1,
                "grpc.keepalive_permit_without_calls": 1,
            };
        } else {
            security = credentials.createInsecure();
        }

        /**
         * @type {Client}
         * @private
         */
        this._client = new Client(address, security, options)

        // /**
        //  * @type {Client}
        //  * @private
        //  */
        // this._client = new Client(address, credentials.createInsecure());
    }

    /**
     * @internal
     * @param {string} address
     * @param {Uint8Array=} certHash
     * @returns {Promise<NodeChannel>}
     */
    static async new(address, certHash) {
//         let cert = undefined;
//         if (address.endsWith(":50212") || address.endsWith(":433")) {
//             // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
//             const response = tls.connect({
//                 host: "0.previewnet.hedera.com",
//                 rejectUnauthorized: false,
//                 ciphers: "ALL",
//                 port: 50211,
//                 checkServerIdentity: (_, __) => {
//                     console.log("gggggggggggggggggggggggggggggggggg");
//                     return undefined;
//                 }
//             }, () => console.log("SecureConnectionListener callback called"));
// 
//             await new Promise((resolved) => setTimeout(resolved, 1000));
// 
//             console.log("Peer Certificate:", response.getPeerCertificate(true));
//             console.log("Certificate:", response.getCertificate());
// 
//             // console.log(response.getX509Certificate());
// 
//             // const response = new Promise((reject, resolve) => {
//             //     https.get(options, (res) => {
//             //         res.socket.connect.getPeerCertificate();
//             //     });
//             // });
//         }

        return new NodeChannel(address, certHash, new Uint8Array());
=======
        this._client = new Client(address, security, options);
>>>>>>> 5d5237f1 (feat: begin on node/network refactor)
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
     * @protected
     * @param {string} serviceName
     * @returns {import("protobufjs").RPCImpl}
     */
    _createUnaryClient(serviceName) {
        return (method, requestData, callback) => {
            if (this._client.getChannel().getConnectivityState(false) == 4) {
                callback(new GrpcServicesError(GrpcStatus.Unavailable));
                return;
            }

            let received = false;

            setTimeout(() => {
                if (!received) {
                    this._client.close();
                    callback(new GrpcServicesError(GrpcStatus.Unavailable));
                }
            }, 10_000);

            this._client.getChannel().getConnectivityState(false);

            console.log('eeeeeeeeeeeeeeeeeeee');
            this._client.makeUnaryRequest(
                `/proto.${serviceName}/${method.name}`,
                (value) => value,
                (value) => {
                    received = true;
                    return value;
                },
                Buffer.from(requestData),
                (e, r) => {
                    callback(e, r);
                }
            );
        };
    }
}
