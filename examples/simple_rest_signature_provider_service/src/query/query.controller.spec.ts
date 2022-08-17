import { Test, TestingModule } from "@nestjs/testing";
import { QueryController } from "./query.controller";

describe("QueryController", () => {
    let controller: QueryController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QueryController],
        }).compile();

        controller = module.get<QueryController>(QueryController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
