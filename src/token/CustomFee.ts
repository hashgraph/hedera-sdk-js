import { AccountId } from "../account/AccountId";
import { CustomFee as ProtoCustomFee } from "../generated/CustomFees_pb";

export abstract class CustomFee {
    public readonly feeCollectorAccountId: AccountId | null = null;

    public constructor(fee?: ProtoCustomFee) {
        if (fee != null) {
            this.feeCollectorAccountId = fee.hasFeeCollectorAccountId() ?
                AccountId._fromProto(fee.getFeeCollectorAccountId()!) :
                null;
        }
    }

    // NOT A STABLE API
    public _toProto(): ProtoCustomFee {
        const builder = new ProtoCustomFee();

        if (this.feeCollectorAccountId != null) {
            builder.setFeeCollectorAccountId(this.feeCollectorAccountId._toProto());
        }

        return builder;
    }
}
