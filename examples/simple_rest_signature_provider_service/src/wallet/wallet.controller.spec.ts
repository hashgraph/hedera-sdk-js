import { Test, TestingModule } from "@nestjs/testing";
import { WalletController } from "./wallet.controller";

describe("WalletController", () => {
  let controller: WalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
