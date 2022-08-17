import { Validate } from "class-validator";
import { Query } from "./query.validator";

export class QueryDto {
    @Validate(Query)
    bytes: string;
}
