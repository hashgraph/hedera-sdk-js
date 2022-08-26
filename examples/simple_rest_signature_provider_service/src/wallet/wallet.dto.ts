import { Validate } from "class-validator";
import { WalletValidator } from "./wallet.validator";

export class WalletDto {
    @Validate(WalletValidator)
    accountId?: string;
}
