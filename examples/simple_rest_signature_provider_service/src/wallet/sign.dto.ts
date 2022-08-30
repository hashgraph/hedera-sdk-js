import { Validate } from "class-validator";
import { HexValidator } from "./hex.validator";

export class SignDto {
    @Validate(HexValidator)
    bytes: string[];
}
