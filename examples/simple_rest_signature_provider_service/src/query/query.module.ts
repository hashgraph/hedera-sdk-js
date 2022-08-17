import { Module } from "@nestjs/common";
import { QueryController } from "./query.controller";

@Module({
    controllers: [QueryController],
})
export class QueryModule {}
