import BigNumber from "bignumber.js";
import { CustomFee as ProtoCustomFee, RoyaltyFee as ProtoRoyaltyFee } from "../generated/custom_fees_pb";
import { Fraction as ProtoFraction } from "../generated/basic_types_pb";
import { CustomFee } from "./CustomFee";
import { CustomFixedFee } from "./CustomFixedFee";

export class CustomRoyaltyFee extends CustomFee {
    public numerator: BigNumber | null = null;
    public denominator: BigNumber | null = null;
    public fallbackFee: CustomFixedFee | null = null;

    public constructor(fee?: ProtoCustomFee) {
        super(fee);

        if (fee != null) {
            const royaltyFee = fee.getRoyaltyFee();

            if (royaltyFee == null) {
                return;
            }

            const fraction = royaltyFee.getExchangeValueFraction();

            if (fraction != null) {
                this.numerator = new BigNumber(fraction.getNumerator());
                this.denominator = new BigNumber(fraction.getDenominator());
            }

            if (royaltyFee.getFallbackFee() != null) {
                const protoFallbackFee = new ProtoCustomFee();
                protoFallbackFee.setFixedFee(royaltyFee.getFallbackFee());
                this.fallbackFee = new CustomFixedFee(protoFallbackFee);
            }
        }
    }

    public setNumerator(numerator: BigNumber): this {
        this.numerator = numerator;
        return this;
    }

    public setDenominator(denominator: BigNumber): this {
        this.denominator = denominator;
        return this;
    }

    public setFallbackFee(fallbackFee: CustomFixedFee): this {
        this.fallbackFee = fallbackFee;
        return this;
    }

    // NOT A STABLE API
    public _toProto(): ProtoCustomFee {
        const builder = new ProtoCustomFee();
        const royaltyFeeBuilder = new ProtoRoyaltyFee();
        const fraction = new ProtoFraction();

        if (this.numerator != null) {
            fraction.setNumerator(this.numerator.toString());
        }

        if (this.denominator != null) {
            fraction.setDenominator(this.denominator.toString());
        }

        if (this.fallbackFee != null) {
            royaltyFeeBuilder.setFallbackFee(this.fallbackFee._toProto().getFixedFee());
        }

        builder.setRoyaltyFee(royaltyFeeBuilder);

        return builder;
    }
}
