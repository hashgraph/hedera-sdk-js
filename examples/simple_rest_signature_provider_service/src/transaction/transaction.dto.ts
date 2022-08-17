import { Validate } from "class-validator";
import { Transaction } from "./transaction.validator";

export class TransactionDto {
    @Validate(Transaction)
    bytes: string;
}
