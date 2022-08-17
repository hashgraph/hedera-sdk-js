import { Test, TestingModule } from "@nestjs/testing";
import { WalletService } from "../wallet/wallet.service";
import { TransactionController } from "./transaction.controller";

describe("TransactionController", () => {
    let controller: TransactionController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransactionController],
            providers: [WalletService],
        }).compile();

        controller = module.get<TransactionController>(TransactionController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
