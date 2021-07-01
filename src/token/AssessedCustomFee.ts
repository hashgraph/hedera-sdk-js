import BigNumber from "bignumber.js";
import { TokenId } from "./TokenId";
import { AccountId } from "../account/AccountId";
import { AssessedCustomFee as ProtoAssessedCustomFee } from "../generated/CustomFees_pb";

export class AssessedCustomFee {
    public readonly amount: BigNumber | null = null;
    public readonly tokenId: TokenId | null = null;
    public readonly feeCollectorAccountId: AccountId | null = null;

    public constructor(fee?: ProtoAssessedCustomFee) {
        if (fee != null) {
            this.amount = new BigNumber(fee.getAmount());
            this.tokenId = fee.hasTokenId() ?
                TokenId._fromProto(fee.getTokenId()!) :
                null;
            this.feeCollectorAccountId = fee.hasFeeCollectorAccountId() ?
                AccountId._fromProto(fee.getFeeCollectorAccountId()!) :
                null;
        }
    }

    // NOT A STABLE API
    public _toProto(): ProtoAssessedCustomFee {
        const builder = new ProtoAssessedCustomFee();

        if (this.tokenId != null) {
            builder.setTokenId(this.tokenId._toProto());
        }

        if (this.feeCollectorAccountId != null) {
            builder.setFeeCollectorAccountId(this.feeCollectorAccountId._toProto());
        }

        return builder;
    }
}
