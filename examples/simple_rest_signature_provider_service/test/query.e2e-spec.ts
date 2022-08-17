import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { QueryModule } from "../src/query/query.module";
import {
    AccountInfoJson,
    AccountInfoQuery,
    Wallet,
} from "@hashgraph/sdk";
import { WalletService } from "../src/wallet/wallet.service";

describe("QueryController (e2e)", () => {
    let app: INestApplication;
    let wallet: Wallet;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [QueryModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        wallet = app.get<WalletService>(WalletService).wallet;
    });

    it("should be able to execute query", async () => {
        const query = new AccountInfoQuery().setAccountId(
            wallet.getAccountId(),
        );

        const body = {
            bytes: Buffer.from(query.toBytes()).toString("hex"),
        };

        return request(app.getHttpServer())
            .post("/query/execute")
            .send(body)
            .expect(200)
            .expect((response: AccountInfoJson) => {
                expect(response.accountId).toBe(
                    wallet.getAccountId().toString(),
                );
                // TODO: Validate everything else
            });
    });
});
