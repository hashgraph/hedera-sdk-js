import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { TransactionModule } from "./../src/transaction/transaction.module";
import {
    TransactionResponseJSON,
    TransferTransaction,
    Wallet,
    Transaction,
    PublicKey,
} from "@hashgraph/sdk";
import { WalletService } from "../src/wallet/wallet.service";

// Transaction Bytes with no signatures
const bytes =
    "0a4d2a4b0a470a100a0408011002120608001000180318001206080010001803188084af5f2202087832005a2030ffffffffffffffff7f38ffffffffffffffff7f40004a050880ceda038801001200";
const body = { bytes };

describe("TransactionController (e2e)", () => {
    let app: INestApplication;
    let wallet: Wallet;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TransactionModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        wallet = app.get<WalletService>(WalletService).wallet;
    });

    it("should be able to sign transaction", () => {
        return request(app.getHttpServer())
            .post("/transaction/sign")
            .send(body)
            .expect(200)
            .expect((response: string) => {
                // The bytes should differ
                expect(response).not.toBe(bytes);
                const transaction = Transaction.fromBytes(
                    Buffer.from(response, "hex"),
                );
                const sigantures = transaction.getSignatures();

                const publicKey = wallet.getAccountKey() as PublicKey;

                expect(sigantures.size).toBe(1);
                expect(publicKey.verifyTransaction(transaction)).toBeTruthy();
            });
    });

    it("should be able to execute transaction", async () => {
        const transaction = await new TransferTransaction()
            .addHbarTransfer(wallet.getAccountId(), -1)
            .addHbarTransfer("0.0.3", 1)
            .freezeWithSigner(wallet);

        const body = {
            bytes: Buffer.from(transaction.toBytes()).toString("hex"),
        };

        return request(app.getHttpServer())
            .post("/transaction/execute")
            .send(body)
            .expect(200)
            .expect((response: TransactionResponseJSON) => {
                expect(
                    Buffer.from(response.transactionHash, "hex").length,
                ).toBe(48);
                expect(response.nodeId).toBe("0.0.3");
                expect(response.transactionId).toContain(
                    wallet.getAccountId().toString(),
                );
            });
    });
});
