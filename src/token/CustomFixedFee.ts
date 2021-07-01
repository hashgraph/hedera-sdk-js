import BigNumber from "bignumber.js";
import { TokenId } from "./TokenId";
import { CustomFee as ProtoCustomFee, FixedFee as ProtoFixedFee } from "../generated/CustomFees_pb";
import { CustomFee } from "./CustomFee";

export class CustomFixedFee extends CustomFee {
    public readonly amount: BigNumber | null = null;
    public readonly denominatingTokenId: TokenId | null = null;

    public constructor(fee?: ProtoCustomFee) {
        super(fee);

        if (fee != null) {
            const fixedFee = fee.getFixedFee();

            if (fixedFee == null) {
                return;
            }

            this.amount = new BigNumber(fixedFee.getAmount());
            this.denominatingTokenId = fixedFee.hasDenominatingTokenId() ?
                TokenId._fromProto(fixedFee.getDenominatingTokenId()!) :
                null;
        }
    }

    // NOT A STABLE API
    public _toProto(): ProtoCustomFee {
        const builder = new ProtoCustomFee();
        const fixedFeeBuilder = new ProtoFixedFee();

        if (this.denominatingTokenId != null) {
            fixedFeeBuilder.setDenominatingTokenId(this.denominatingTokenId._toProto());
        }

        if (this.amount != null) {
            fixedFeeBuilder.setAmount(this.amount.toString());
        }

        builder.setFixedFee(fixedFeeBuilder);

        return builder;
    }
}
