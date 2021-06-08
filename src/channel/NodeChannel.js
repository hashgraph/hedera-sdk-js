import { Client, credentials } from "@grpc/grpc-js";
import Channel from "./Channel.js";
import * as utf8 from "../encoding/utf8.js";

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
     * @param {string | undefined} certificate
     */
    constructor(address, certificate) {
        super();

        let clientCredentials;
        let clientAddress;

        if (certificate != null) {
            clientCredentials = credentials.createSsl(
                Buffer.from(utf8.encode(certificate))
            );
            clientAddress = `${address.split(":")[0]}:50212`;
        } else if (!address.endsWith(":50212")) {
            clientCredentials = credentials.createInsecure();
            clientAddress = `${address.split(":")[0]}:50211`;
        } else {
            throw new Error(
                `requested a TLS connection without an associated certificate for node: ${address}`
            );
        }

        /**
         * @type {Client}
         * @private
         */
        this._client = new Client(clientAddress, clientCredentials, {
            "grpc.ssl_target_name_override": "127.0.0.1",
            "grpc.default_authority": "127.0.0.1",
        });
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
            this._client.makeUnaryRequest(
                `/proto.${serviceName}/${method.name}`,
                (value) => value,
                (value) => value,
                Buffer.from(requestData),
                callback
            );
        };
    }
}
