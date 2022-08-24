import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { QueryModule } from "../src/query/query.module";
import { AccountInfoQuery, Wallet } from "@hashgraph/sdk";
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

    afterEach(async () => {
        await app.close();
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
            .then((response) => {
                expect(response.status).toBe(200);

                const bytes = Buffer.from(response.body.response, "hex");
                const info = query._deserializeResponse(bytes);
                expect(info.accountId.toString()).toBe(
                    wallet.getAccountId().toString(),
                );
                // TODO: Validate everything else
            });
    });
});
