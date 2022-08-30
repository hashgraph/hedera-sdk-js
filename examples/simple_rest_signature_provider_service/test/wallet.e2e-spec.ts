import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { WalletModule } from "./../src/wallet/wallet.module";
import { Wallet, PublicKey, AccountId } from "@hashgraph/sdk";
import { WalletService } from "../src/wallet/wallet.service";

describe("WalletController (e2e)", () => {
    let app: INestApplication;
    let wallet: Wallet;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [WalletModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();

        wallet = app.get<WalletService>(WalletService).wallet;
    });

    afterEach(async () => {
        await app.close();
    });

    it("sign", async () => {
        // Wallet Bytes with no signatures
        const message = Buffer.from("random bytes", "utf8");
        const body = { bytes: [message.toString("hex")] };

        return request(app.getHttpServer())
            .post("/wallet/sign")
            .send(body)
            .then((response) => {
                expect(response.status).toBe(200);

                for (const signerSignature of response.body.response) {
                    const publicKey = PublicKey.fromString(
                        signerSignature.publicKey,
                    );
                    const signature = Buffer.from(
                        signerSignature.signature,
                        "hex",
                    );
                    const accountId = AccountId.fromString(
                        signerSignature.accountId,
                    );

                    expect(publicKey.verify(message, signature)).toBeTruthy();
                    expect(accountId.toString()).toEqual(
                        wallet.getAccountId().toString(),
                    );
                }
            });
    });
});
