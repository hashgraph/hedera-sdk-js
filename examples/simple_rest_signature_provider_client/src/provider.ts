import * as hashgraph from "@hashgraph/sdk";
import axios, { AxiosInstance } from "axios";

const instance = axios.create({
    baseURL: "http://127.0.0.1:3000/",
});

export class SimpleRestProvider implements hashgraph.Provider {
    private ledgerId: hashgraph.LedgerId | null;
    private network: Record<string, string>;
    private mirrorNetwork: string[];

    public instance: AxiosInstance;

    constructor(
        ledgerId: hashgraph.LedgerId | null,
        network: Record<string, string>,
        mirrorNetwork: string[]
    ) {
        this.ledgerId = ledgerId;
        this.network = network;
        this.mirrorNetwork = mirrorNetwork;

        this.instance = axios.create({
            baseURL: "http://127.0.0.1:3000/",
        });
    }

    getLedgerId(): hashgraph.LedgerId | null {
        return this.ledgerId;
    }

    getNetwork(): Record<string, string> {
        return this.network;
    }

    getMirrorNetwork(): string[] {
        return this.mirrorNetwork;
    }

    getAccountBalance(
        accountId: hashgraph.AccountId | string
    ): Promise<hashgraph.AccountBalance> {
        return this.call(
            new hashgraph.AccountBalanceQuery().setAccountId(accountId)
        );
    }

    getAccountInfo(
        accountId: hashgraph.AccountId | string
    ): Promise<hashgraph.AccountInfo> {
        return this.call(
            new hashgraph.AccountInfoQuery().setAccountId(accountId)
        );
    }

    getAccountRecords(
        accountId: hashgraph.AccountId | string
    ): Promise<hashgraph.TransactionRecord[]> {
        return this.call(
            new hashgraph.AccountRecordsQuery().setAccountId(accountId)
        );
    }

    getTransactionReceipt(
        transactionId: hashgraph.TransactionId | string
    ): Promise<hashgraph.TransactionReceipt> {
        return this.call(
            new hashgraph.TransactionReceiptQuery().setTransactionId(
                transactionId
            )
        );
    }

    waitForReceipt(
        response: hashgraph.TransactionResponse
    ): Promise<hashgraph.TransactionReceipt> {
        return this.call(
            new hashgraph.TransactionReceiptQuery().setTransactionId(
                response.transactionId
            )
        );
    }

    async call<RequestT, ResponseT, OutputT>(
        request: hashgraph.Executable<RequestT, ResponseT, OutputT>
    ): Promise<OutputT> {
        let bytes = Buffer.from(request.toBytes());
        const url =
            request instanceof hashgraph.Transaction
                ? "/transaction/execute"
                : "/query/execute";

        const response = await execute(url, { bytes: bytes.toString("hex") });
        bytes = Buffer.from(response.response, "hex");

        // TODO: We should not be calling private methods
        return request._deserializeResponse(bytes);
    }
}

export async function execute<T extends Record<string, any>>(
    url: string,
    body: any
): Promise<T> {
    const response: T | { error?: hashgraph.StatusErrorJSON | string } = (
        await instance.post(url, body)
    ).data;

    if (response.error != null) {
        throw hashgraph.StatusError.isStatusErrorJSON(response.error)
            ? hashgraph.StatusError.fromJSON(response.error)
            : new Error(response.error);
    }

    return response as T;
}
