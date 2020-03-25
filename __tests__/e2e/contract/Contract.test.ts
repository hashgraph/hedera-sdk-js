import {
    Client,
    Ed25519PrivateKey,
    FileCreateTransaction,
    ContractFunctionParams,
    FileDeleteTransaction,
    ContractCallQuery,
    ContractExecuteTransaction,
    ContractBytecodeQuery,
    ContractCreateTransaction,
    ContractInfoQuery,
    ContractRecordsQuery,
    ContractUpdateTransaction,
    ContractDeleteTransaction,
    Hbar
} from "../../../src/index-node";

describe("ContractCreateTransaction", () => {
    it("can be executed", async () => {
        const smartContract = require("../../../examples/stateful.json");
        const smartContractByteCode = smartContract.contracts[ "stateful.sol:StatefulContract" ].bin;

        if (process.env.OPERATOR_KEY == null || process.env.OPERATOR_ID == null) {
            throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
        }

        const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
        const operatorAccount = process.env.OPERATOR_ID;

        const client = Client
            .forTestnet()
            .setOperator(operatorAccount, operatorPrivateKey);

        let transactionId = await new FileCreateTransaction()
            .addKey(operatorPrivateKey.publicKey)
            .setContents(smartContractByteCode)
            .setMaxTransactionFee(new Hbar(3))
            .execute(client);

        let receipt = await transactionId.getReceipt(client);

        const file = receipt.getFileId();

        transactionId = await new ContractCreateTransaction()
            .setAdminKey(operatorPrivateKey.publicKey)
            .setGas(2000)
            .setConstructorParams(new ContractFunctionParams().addString("hello from hedera"))
            .setBytecodeFileId(file)
            .setContractMemo("[e2e::ContractCreateTransaction]")
            .setMaxTransactionFee(new Hbar(20))
            .execute(client);

        receipt = await transactionId.getReceipt(client);

        const contract = receipt.getContractId();

        let info = await new ContractInfoQuery()
            .setContractId(contract)
            .setMaxQueryPayment(new Hbar(2))
            .execute(client);

        expect(info.contractId).toStrictEqual(contract);
        expect(info.accountId.toString()).toBe(contract.toString());
        expect(info.adminKey!.toString()).toBe(operatorPrivateKey.publicKey.toString());
        expect(info.storage).toBe(926);
        expect(info.contractMemo).toBe("[e2e::ContractCreateTransaction]");

        await transactionId.getReceipt(client);

        const bytecode = await new ContractBytecodeQuery()
            .setContractId(contract)
            .setMaxQueryPayment(new Hbar(2))
            .execute(client);

        expect(bytecode.length).toBe(798);

        let result = await new ContractCallQuery()
            .setContractId(contract)
            .setGas(1000) // ~897
            .setFunction("getMessage", null)
            .execute(client);

        expect(result.getString(0)).toBe("hello from hedera");

        transactionId = await new ContractExecuteTransaction()
            .setContractId(contract)
            .setGas(10000)
            .setFunction("setMessage", new ContractFunctionParams().addString("new message"))
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await transactionId.getReceipt(client);

        result = await new ContractCallQuery()
            .setContractId(contract)
            .setGas(1000) // ~897
            .setFunction("getMessage", null)
            .execute(client);

        expect(result.getString(0)).toBe("new message");

        const records = await new ContractRecordsQuery()
            .setContractId(contract)
            .setMaxQueryPayment(new Hbar(5))
            .execute(client);

        for(const record of records) {
            expect(record.receipt).toBeDefined();
        }

        transactionId = await new ContractUpdateTransaction()
            .setContractId(contract)
            .setContractMemo("[e2e::ContractUpdateTransaction]")
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await transactionId.getReceipt(client);

        info = await new ContractInfoQuery()
            .setContractId(contract)
            .setMaxQueryPayment(new Hbar(2))
            .execute(client);

        expect(info.contractId).toStrictEqual(contract);
        expect(info.accountId.toString()).toBe(contract.toString());
        expect(info.adminKey!.toString()).toBe(operatorPrivateKey.publicKey.toString());
        expect(info.storage).toBe(926);
        expect(info.contractMemo).toBe("[e2e::ContractUpdateTransaction]");

        transactionId = await new ContractDeleteTransaction()
            .setContractId(contract)
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);

        await transactionId.getReceipt(client);

        let errorThrown = false;
        try {
            await new ContractInfoQuery()
                .setContractId(contract)
                .setMaxQueryPayment(new Hbar(2))
                .execute(client);
        } catch {
            errorThrown = true;
        }

        expect(errorThrown).toBe(true);

        transactionId = await new FileDeleteTransaction()
            .setFileId(file)
            .setMaxTransactionFee(new Hbar(5))
            .execute(client);
    }, 60000);
});
