import { Client, AccountBalanceQuery } from "@hashgraph/sdk";
import GrpcServer from "./server.js";
import Long from "long";

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

const PROTOS = [
    "./src/proto/crypto_service.proto",
    "./src/proto/basic_types.proto",
    "./src/proto/account_balance_file.proto",
    "./src/proto/basic_types.proto",
    "./src/proto/consensus_create_topic.proto",
    "./src/proto/consensus_delete_topic.proto",
    "./src/proto/consensus_get_topic_info.proto",
    "./src/proto/consensus_service.proto",
    "./src/proto/consensus_submit_message.proto",
    "./src/proto/consensus_topic_info.proto",
    "./src/proto/consensus_update_topic.proto",
    "./src/proto/contract_call.proto",
    "./src/proto/contract_call_local.proto",
    "./src/proto/contract_create.proto",
    "./src/proto/contract_delete.proto",
    "./src/proto/contract_get_bytecode.proto",
    "./src/proto/contract_get_info.proto",
    "./src/proto/contract_get_records.proto",
    "./src/proto/contract_update.proto",
    "./src/proto/crypto_add_live_hash.proto",
    "./src/proto/crypto_create.proto",
    "./src/proto/crypto_delete.proto",
    "./src/proto/crypto_delete_live_hash.proto",
    "./src/proto/crypto_get_account_balance.proto",
    "./src/proto/crypto_get_account_records.proto",
    "./src/proto/crypto_get_info.proto",
    "./src/proto/crypto_get_live_hash.proto",
    "./src/proto/crypto_get_stakers.proto",
    "./src/proto/crypto_service.proto",
    "./src/proto/crypto_transfer.proto",
    "./src/proto/crypto_update.proto",
    "./src/proto/custom_fees.proto",
    "./src/proto/duration.proto",
    "./src/proto/exchange_rate.proto",
    "./src/proto/file_append.proto",
    "./src/proto/file_create.proto",
    "./src/proto/file_delete.proto",
    "./src/proto/file_get_contents.proto",
    "./src/proto/file_get_info.proto",
    "./src/proto/file_service.proto",
    "./src/proto/file_update.proto",
    "./src/proto/freeze.proto",
    "./src/proto/freeze_service.proto",
    "./src/proto/freeze_type.proto",
    "./src/proto/get_by_key.proto",
    "./src/proto/get_by_solidity_id.proto",
    "./src/proto/mirror_consensus_service.proto",
    "./src/proto/network_get_version_info.proto",
    "./src/proto/network_service.proto",
    "./src/proto/query.proto",
    "./src/proto/query_header.proto",
    "./src/proto/response.proto",
    "./src/proto/response_code.proto",
    "./src/proto/response_header.proto",
    "./src/proto/schedulable_transaction_body.proto",
    "./src/proto/schedule_create.proto",
    "./src/proto/schedule_delete.proto",
    "./src/proto/schedule_get_info.proto",
    "./src/proto/schedule_service.proto",
    "./src/proto/schedule_sign.proto",
    "./src/proto/smart_contract_service.proto",
    "./src/proto/system_delete.proto",
    "./src/proto/system_undelete.proto",
    "./src/proto/throttle_definitions.proto",
    "./src/proto/timestamp.proto",
    "./src/proto/token_associate.proto",
    "./src/proto/token_burn.proto",
    "./src/proto/token_create.proto",
    "./src/proto/token_delete.proto",
    "./src/proto/token_dissociate.proto",
    "./src/proto/token_fee_schedule_update.proto",
    "./src/proto/token_freeze_account.proto",
    "./src/proto/token_get_account_nft_infos.proto",
    "./src/proto/token_get_info.proto",
    "./src/proto/token_get_nft_info.proto",
    "./src/proto/token_get_nft_infos.proto",
    "./src/proto/token_grant_kyc.proto",
    "./src/proto/token_mint.proto",
    "./src/proto/token_pause.proto",
    "./src/proto/token_revoke_kyc.proto",
    "./src/proto/token_service.proto",
    "./src/proto/token_unfreeze_account.proto",
    "./src/proto/token_unpause.proto",
    "./src/proto/token_update.proto",
    "./src/proto/token_wipe_account.proto",
    "./src/proto/transaction.proto",
    "./src/proto/transaction_body.proto",
    "./src/proto/transaction_contents.proto",
    "./src/proto/transaction_get_fast_record.proto",
    "./src/proto/transaction_get_receipt.proto",
    "./src/proto/transaction_get_record.proto",
    "./src/proto/transaction_list.proto",
    "./src/proto/transaction_receipt.proto",
    "./src/proto/transaction_record.proto",
    "./src/proto/transaction_response.proto",
    "./src/proto/unchecked_submit.proto",
    "./src/proto/wrappers.proto",
];

const server = new GrpcServer(PROTOS, "proto")
    .addService("CryptoService", [{
            response: {
                cryptogetAccountBalance: {
                    header: { nodeTransactionPrecheckCode: 0 },
                    balance: Long.fromValue(10),
                },
            }
        }],
    )
    .listen("0.0.0.0:50211");

async function main() {
    const client = Client.forNetwork({ "0.0.0.0:50211": "0.0.3" });

    let balance = await new AccountBalanceQuery()
        .setAccountId("0.0.3")
        .execute(client);
    console.log(balance.hbars.toString());

    server.close(true);
}

void main();
