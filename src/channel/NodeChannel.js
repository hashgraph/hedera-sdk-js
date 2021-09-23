import { Client, credentials } from "@grpc/grpc-js";
import Channel from "./Channel.js";
import GrpcServicesError from "../grpc/GrpcServiceError.js";
import GrpcStatus from "../grpc/GrpcStatus.js";
import * as sha384 from "../cryptography/sha384.js";
import * as hex from "../encoding/hex.js";
import * as utf8 from "../encoding/utf8.js";
import * as https from "https";
import * as tls from "tls";

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
     * @param {Uint8Array=} certHash
     * @param {Uint8Array=} cert
     */
    constructor(address, certHash, cert) {
        super();

        this.certHash = certHash != null ? utf8.decode(certHash) : null;

        let security;


        const realCert = `-----BEGIN CERTIFICATE-----
MIICnzCCAiWgAwIBAgIUenyqJ4UaFBbwokatcUqAwW3o3rswCgYIKoZIzj0EAwMw
gYQxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJUWDETMBEGA1UEBwwKUmljaGFyZHNv
bjEPMA0GA1UECgwGSGVkZXJhMQ8wDQYDVQQLDAZIZWRlcmExEDAOBgNVBAMMBzAw
MDAwMDAxHzAdBgkqhkiG9w0BCQEWEGFkbWluQGhlZGVyYS5jb20wIBcNMjEwODIz
MjIyMTU4WhgPMjI5NTA2MDcyMjIxNThaMIGEMQswCQYDVQQGEwJVUzELMAkGA1UE
CAwCVFgxEzARBgNVBAcMClJpY2hhcmRzb24xDzANBgNVBAoMBkhlZGVyYTEPMA0G
A1UECwwGSGVkZXJhMRAwDgYDVQQDDAcwMDAwMDAwMR8wHQYJKoZIhvcNAQkBFhBh
ZG1pbkBoZWRlcmEuY29tMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEm5b1+oG9R0qt
zM7UZnS5l/xxUNHIHq5+NAvtlviCpJL19jrW9+/UOy00Qqc6vS6tS1hS+dNJmpiZ
FN0EHew4VDR7ACnL4LDJKmIHWjQ0iwvZo5kCpO0r9BtPN5FvaSxyo1QwUjAPBgNV
HREECDAGhwR/AAABMAsGA1UdDwQEAwIEsDATBgNVHSUEDDAKBggrBgEFBQcDATAd
BgNVHQ4EFgQUeciBviJtjeuue0GPf1xllNw7qvYwCgYIKoZIzj0EAwMDaAAwZQIw
JeG0H2HdsI1VhOYmJmYlNeKCNgAk+LMorzPmsIInVBO2HK2IrKfpReWDS/m5j51V
AjEAxKBxDezJDqAZHTkTXCg+X9Q9V6J6M5yDy5IS90aCWEo+W8C1Hc6hkn2/NrvT
PhwK
-----END CERTIFICATE-----
        `;

        security = credentials.createSsl(Buffer.from(realCert));
        // security = credentials.createSsl(Buffer.from("a"), null, null, {
        //     checkServerIdentity: () => {
        //         console.log("inside checkServerIdentity")
        //         return undefined;
        //     },
        // });

        /**
         * @type {Client}
         * @private
         */
        this._client = new Client(address, security, {
            "grpc.ssl_target_name_override": "127.0.0.1",
            "grpc.default_authority": "127.0.0.1",
<<<<<<< HEAD
            "grpc.http_connect_creds": "0",
            // https://github.com/grpc/grpc-node/issues/1593
            // https://github.com/grpc/grpc-node/issues/1545
            // https://github.com/grpc/grpc/issues/13163
            "grpc.keepalive_timeout_ms": 1,
            "grpc.keepalive_permit_without_calls": 1,
=======
>>>>>>> 1838bf4a (fix: store cert locally)
        });

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
                    console.log(e);
                    console.log(r);
                    callback(e, r);
                }
            );
        };
    }
}
