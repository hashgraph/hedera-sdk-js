import {
    ContractCreateFlow,
    ContractFunctionParameters,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";
import { smartContractBytecode } from "./ContractCreateIntegrationTest.js";

describe("ContractCreateFlow", function () {
    it("works", async function () {
        this.timeout(120000);

        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;

        await new ContractCreateFlow()
            .setBytecode(smartContractBytecode)
            .setAdminKey(operatorKey)
            .setGas(100000)
            .setConstructorParameters(
                new ContractFunctionParameters().addString("Hello from Hedera.")
            )
            .setContractMemo("[e2e::ContractCreateTransaction]")
            .execute(env.client);
    });
});
