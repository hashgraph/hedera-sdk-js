import { CustomFees as ProtoCustomFees, CustomFee as ProtoCustomFee } from "../generated/CustomFees_pb";
import { CustomFee } from "./CustomFee";
import { CustomFixedFee } from "./CustomFixedFee";
import { CustomFractionalFee } from "./CustomFractionalFee";

export class CustomFeeList {
    public readonly canUpdate: boolean = true;
    public readonly customFees: CustomFee[] = [];

    public constructor(fees?: ProtoCustomFees) {
        if (fees != null) {
            this.canUpdate = fees.getCanUpdateWithAdminKey();
            for (const fee of fees.getCustomFeesList()) {
                switch (fee.getFeeCase()) {
                    case ProtoCustomFee.FeeCase.FIXED_FEE:
                        this.customFees.push(new CustomFixedFee(fee));
                        break;
                    case ProtoCustomFee.FeeCase.FRACTIONAL_FEE:
                        this.customFees.push(new CustomFractionalFee(fee));
                        break;
                    default:
                        throw new Error("custom fee is not set");
                }
            }
        }
    }

    // NOT A STABLE API
    public _toProto(): ProtoCustomFees {
        const builder = new ProtoCustomFees();
        builder.setCanUpdateWithAdminKey(this.canUpdate);

        for (const fee of this.customFees) {
            builder.addCustomFees(fee._toProto());
        }

        return builder;
    }
}
