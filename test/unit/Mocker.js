import { PrivateKey, PublicKey } from "../../src/exports.js";
import Client from "../../src/client/NodeClient.js";
import * as grpc from "@grpc/grpc-js";
import * as loader from "@grpc/proto-loader";

/**
 * @template {*} RequestType
 * @template {*} ResponseType
 * @typedef {import("grpc").handleUnaryCall<RequestType, ResponseType>} grpc.handleUnaryCall<RequestType, ResponseType>
 */

/**
 * @namespace {proto}
 * @typedef {import("@hashgraph/proto").Response} proto.Response
 * @typedef {import("@hashgraph/proto").Query} proto.Query
 */

export const PRIVATE_KEY = PrivateKey.fromString(
    "302e020100300506032b657004220420d45e1557156908c967804615af59a000be88c7aa7058bfcbe0f46b16c28f887d"
);

const PROTOS = [
    "./packages/proto/src/proto/crypto_service.proto",
    "./packages/proto/src/proto/basic_types.proto",
    "./packages/proto/src/proto/account_balance_file.proto",
    "./packages/proto/src/proto/basic_types.proto",
    "./packages/proto/src/proto/consensus_create_topic.proto",
    "./packages/proto/src/proto/consensus_delete_topic.proto",
    "./packages/proto/src/proto/consensus_get_topic_info.proto",
    "./packages/proto/src/proto/consensus_service.proto",
    "./packages/proto/src/proto/consensus_submit_message.proto",
    "./packages/proto/src/proto/consensus_topic_info.proto",
    "./packages/proto/src/proto/consensus_update_topic.proto",
    "./packages/proto/src/proto/contract_call.proto",
    "./packages/proto/src/proto/contract_call_local.proto",
    "./packages/proto/src/proto/contract_create.proto",
    "./packages/proto/src/proto/contract_delete.proto",
    "./packages/proto/src/proto/contract_get_bytecode.proto",
    "./packages/proto/src/proto/contract_get_info.proto",
    "./packages/proto/src/proto/contract_get_records.proto",
    "./packages/proto/src/proto/contract_update.proto",
    "./packages/proto/src/proto/crypto_add_live_hash.proto",
    "./packages/proto/src/proto/crypto_create.proto",
    "./packages/proto/src/proto/crypto_delete.proto",
    "./packages/proto/src/proto/crypto_delete_live_hash.proto",
    "./packages/proto/src/proto/crypto_get_account_balance.proto",
    "./packages/proto/src/proto/crypto_get_account_records.proto",
    "./packages/proto/src/proto/crypto_get_info.proto",
    "./packages/proto/src/proto/crypto_get_live_hash.proto",
    "./packages/proto/src/proto/crypto_get_stakers.proto",
    "./packages/proto/src/proto/crypto_service.proto",
    "./packages/proto/src/proto/crypto_transfer.proto",
    "./packages/proto/src/proto/crypto_update.proto",
    "./packages/proto/src/proto/custom_fees.proto",
    "./packages/proto/src/proto/duration.proto",
    "./packages/proto/src/proto/exchange_rate.proto",
    "./packages/proto/src/proto/file_append.proto",
    "./packages/proto/src/proto/file_create.proto",
    "./packages/proto/src/proto/file_delete.proto",
    "./packages/proto/src/proto/file_get_contents.proto",
    "./packages/proto/src/proto/file_get_info.proto",
    "./packages/proto/src/proto/file_service.proto",
    "./packages/proto/src/proto/file_update.proto",
    "./packages/proto/src/proto/freeze.proto",
    "./packages/proto/src/proto/freeze_service.proto",
    "./packages/proto/src/proto/freeze_type.proto",
    "./packages/proto/src/proto/get_by_key.proto",
    "./packages/proto/src/proto/get_by_solidity_id.proto",
    "./packages/proto/src/proto/mirror_consensus_service.proto",
    "./packages/proto/src/proto/network_get_version_info.proto",
    "./packages/proto/src/proto/network_service.proto",
    "./packages/proto/src/proto/query.proto",
    "./packages/proto/src/proto/query_header.proto",
    "./packages/proto/src/proto/response.proto",
    "./packages/proto/src/proto/response_code.proto",
    "./packages/proto/src/proto/response_header.proto",
    "./packages/proto/src/proto/schedulable_transaction_body.proto",
    "./packages/proto/src/proto/schedule_create.proto",
    "./packages/proto/src/proto/schedule_delete.proto",
    "./packages/proto/src/proto/schedule_get_info.proto",
    "./packages/proto/src/proto/schedule_service.proto",
    "./packages/proto/src/proto/schedule_sign.proto",
    "./packages/proto/src/proto/smart_contract_service.proto",
    "./packages/proto/src/proto/system_delete.proto",
    "./packages/proto/src/proto/system_undelete.proto",
    "./packages/proto/src/proto/throttle_definitions.proto",
    "./packages/proto/src/proto/timestamp.proto",
    "./packages/proto/src/proto/token_associate.proto",
    "./packages/proto/src/proto/token_burn.proto",
    "./packages/proto/src/proto/token_create.proto",
    "./packages/proto/src/proto/token_delete.proto",
    "./packages/proto/src/proto/token_dissociate.proto",
    "./packages/proto/src/proto/token_fee_schedule_update.proto",
    "./packages/proto/src/proto/token_freeze_account.proto",
    "./packages/proto/src/proto/token_get_account_nft_infos.proto",
    "./packages/proto/src/proto/token_get_info.proto",
    "./packages/proto/src/proto/token_get_nft_info.proto",
    "./packages/proto/src/proto/token_get_nft_infos.proto",
    "./packages/proto/src/proto/token_grant_kyc.proto",
    "./packages/proto/src/proto/token_mint.proto",
    "./packages/proto/src/proto/token_pause.proto",
    "./packages/proto/src/proto/token_revoke_kyc.proto",
    "./packages/proto/src/proto/token_service.proto",
    "./packages/proto/src/proto/token_unfreeze_account.proto",
    "./packages/proto/src/proto/token_unpause.proto",
    "./packages/proto/src/proto/token_update.proto",
    "./packages/proto/src/proto/token_wipe_account.proto",
    "./packages/proto/src/proto/transaction.proto",
    "./packages/proto/src/proto/transaction_body.proto",
    "./packages/proto/src/proto/transaction_contents.proto",
    "./packages/proto/src/proto/transaction_get_fast_record.proto",
    "./packages/proto/src/proto/transaction_get_receipt.proto",
    "./packages/proto/src/proto/transaction_get_record.proto",
    "./packages/proto/src/proto/transaction_list.proto",
    "./packages/proto/src/proto/transaction_receipt.proto",
    "./packages/proto/src/proto/transaction_record.proto",
    "./packages/proto/src/proto/transaction_response.proto",
    "./packages/proto/src/proto/unchecked_submit.proto",
    "./packages/proto/src/proto/wrappers.proto",
];

export const ABORTED = {
    name: "ABORTED",
    message: "no response found",
    code: 10,
};

export const UNAVAILABLE = {
    name: "UNAVAILABLE",
    message: "node is UNAVAILABLE",
    code: 14,
};

export const INTERNAL = {
    name: "INTERNAL",
    message: "Received RST_STREAM with code 0",
    code: 13,
};
/**
 * @namespace {proto}
 * @typedef {import("@hashgraph/proto").Response} proto.Response
 * @typedef {import("@hashgraph/proto").Query} proto.Query
 * @typedef {import("@hashgraph/proto").TransactionResponse} proto.TransactionResponse
 */

/**
 * @typedef {object} Response
 * @property {(request: proto.Transaction | proto.Query, index?: number) => proto.Response | proto.TransactionResponse} [call]
 * @property {proto.Response | proto.TransactionResponse} [response]
 * @property {grpc.ServiceError} [error]
 */

class GrpcServer {
    /**
     * @param {string | string[]} paths
     * @param {string} name
     */
    constructor(paths, name) {
        this.server = new grpc.Server();

        const pkg = /** @type {grpc.GrpcObject} */ (
            grpc.loadPackageDefinition(loader.loadSync(paths))[name]
        );

        this.services = Object.entries(pkg)
            .map(([key, value]) => {
                return typeof value === "function"
                    ? /** @type {grpc.ServiceDefinition<grpc.UntypedServiceImplementation>} */ (
                          /** @type {grpc.GrpcObject} */ (pkg[key])["service"]
                      )
                    : null;
            })
            .filter((service) => service != null);

        Object.freeze(this);
    }

    /**
     * Adds a service to the gRPC server
     *
     * @param {?Response[]} responses
     * @returns {this}
     */
    addResponses(responses) {
        /** @type {grpc.UntypedServiceImplementation} */
        const router = {};

        let index = 0;

        for (const service of this.services) {
            for (const key of Object.keys(service)) {
                router[key] = /** @type {grpc.handleUnaryCall<any, any>} */ (
                    call,
                    callback
                ) => {
                    const request = call.request;
                    const response = responses[index];

                    if (response == null) {
                        callback(ABORTED, null);
                    }

                    let value = null;
                    let error = null;

                    if (response.response != null) {
                        value = response.response;
                    }

                    if (response.call != null) {
                        value = response.call(request, index);
                    }

                    if (response.error != null) {
                        error = response.error;
                    } else if (value == null) {
                        error = ABORTED;
                    }

                    callback(error, value);

                    index += 1;
                };
            }

            this.server.addService(service, router);
        }

        return this;
    }

    /**
     * @param {string} port
     * @param {grpc.ServerCredentials} creds
     * @returns {Promise<this>}
     */
    listen(port, creds = grpc.ServerCredentials.createInsecure()) {
        return new Promise((resolve, reject) =>
            this.server.bindAsync(port, creds, (error) => {
                if (error != null) {
                    reject(error);
                    return;
                }

                this.server.start();
                resolve(this);
            })
        );
    }

    close() {
        this.server.forceShutdown();
    }
}

export default class Mocker {
    /**
     * Creates a mock server and client with the given responses
     *
     * @param {?Response[][]} responses
     * @returns {Promise<{servers: GrpcServers, client: NodeClient}>}
     */
    static async withResponses(responses) {
        const servers = new GrpcServers();

        for (const response of responses) {
            servers.addServer(response);
        }

        const client = await servers.listen();
        client.setOperator("0.0.1854", PRIVATE_KEY);

        return { client, servers };
    }

    /**
     * @param {proto.ISignedTransaction | null | undefined} signedTransaction
     * @returns {boolean}
     */
    static verifySignatures(signedTransaction) {
        if (
            signedTransaction.bodyBytes == null ||
            signedTransaction.sigMap == null ||
            signedTransaction.sigMap.sigPair == null ||
            signedTransaction.sigMap.sigPair.length === 0
        ) {
            return false;
        }

        for (const sigPair of signedTransaction.sigMap.sigPair) {
            let verified = false;

            if (sigPair.ed25519 != null) {
                verified = PublicKey.fromBytesED25519(
                    sigPair.pubKeyPrefix
                ).verify(signedTransaction.bodyBytes, sigPair.ed25519);
            } else if (sigPair.ECDSASecp256k1 != null) {
                verified = PublicKey.fromBytesECDSA(
                    sigPair.pubKeyPrefix
                ).verify(signedTransaction.bodyBytes, sigPair.ECDSASecp256k1);
            }

            if (!verified) {
                return false;
            }
        }

        return true;
    }
}

class GrpcServers {
    constructor() {
        /** @type {GrpcServer[]} */
        this._servers = [];

        /** @type {string[]} */
        this._addresses = [];

        /** @type {string[]} */
        this._nodeAccountIds = [];

        this._index = 0;
    }

    /**
     * @param {Response[]} responses
     * @returns {this}
     */
    addServer(responses) {
        const address = `0.0.0.0:${50213 + this._index}`;
        const nodeAccountId = `0.0.${3 + this._index}`;
        const server = new GrpcServer(PROTOS, "proto").addResponses(responses);

        this._servers.push(server);
        this._addresses.push(address);
        this._nodeAccountIds.push(nodeAccountId);

        this._index += 1;

        return this;
    }

    /**
     * @returns {Promise<Client>}
     */
    async listen() {
        const network = {};

        for (let i = 0; i < this._servers.length; i++) {
            const server = this._servers[i];
            const address = this._addresses[i];
            network[address] = this._nodeAccountIds[i];

            await server.listen(address);
        }

        return Client.forNetwork(network)
            .setNodeMinBackoff(0)
            .setNodeMaxBackoff(0)
            .setNodeMinReadmitPeriod(0)
            .setNodeMaxReadmitPeriod(0);
    }

    close() {
        for (const server of this._servers) {
            server.close();
        }
    }
}
