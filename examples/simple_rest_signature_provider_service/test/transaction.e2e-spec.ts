import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { TransactionModule } from "./../src/transaction/transaction.module";
import {
    TransferTransaction,
    Wallet,
    Transaction,
    PublicKey,
    StatusError,
    Status,
    AccountId,
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
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();

        wallet = app.get<WalletService>(WalletService).wallet;
    });

    afterEach(async () => {
        await app.close();
    });

    it("should be able to sign transaction", async () => {
        return request(app.getHttpServer())
            .post("/transaction/sign")
            .send(body)
            .then((response) => {
                expect(response.status).toBe(200);
    
                const transaction = Transaction.fromBytes(
                    Buffer.from(response.body.response, "hex"),
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
            .then((response) => {
                expect(response.status).toBe(200);
              
                const bytes = Buffer.from(response.body.response, "hex");
                const body = transaction._deserializeResponse(bytes);
                expect(body.transactionHash.length).toBe(48);
                expect(body.nodeId.toString()).toBe("0.0.3");
                expect(body.transactionId.accountId.toString()).toContain(
                    wallet.getAccountId().toString(),
                );
            });
    });
    
    it("should return invalid signature error", async () => {
        // Overwrite the account ID to be invalid so this test should fail
        wallet.accountId = AccountId.fromString("0.0.200000");
    
        const transaction = await new TransferTransaction()
            .addHbarTransfer("0.0.4", 1)
            .addHbarTransfer("0.0.3", -1)
            .freezeWithSigner(wallet);
    
        const body = {
            bytes: Buffer.from(transaction.toBytes()).toString("hex"),
        };
    
        return request(app.getHttpServer())
            .post("/transaction/execute")
            .send(body)
            .then((response) => {
                expect(response.status).toBe(400);
    
                const error = StatusError.fromJSON(response.body.error);
                expect(error.status).toBe(Status.PayerAccountNotFound);
                expect(error.transactionId.accountId.toString()).toBe(wallet.getAccountId().toString());
            });
    });

    it("should return error if invalid request body", async () => {
        const body = { bytes: "00112233445566778899" };

        return request(app.getHttpServer())
            .post("/transaction/execute")
            .send(body)
            .then((response) => {
                expect(response.status).toBe(400);
            });
    });
});
