import BigNumber from "bignumber.js";
import { CustomFee as ProtoCustomFee, FractionalFee as ProtoFractionalFee } from "../generated/custom_fees_pb";
import { Fraction as ProtoFraction } from "../generated/basic_types_pb";
import { CustomFee } from "./CustomFee";

export class CustomFractionalFee extends CustomFee {
    public numerator: BigNumber | null = null;
    public denominator: BigNumber | null = null;
    public min: BigNumber | null = null;
    public max: BigNumber | null = null;

    public constructor(fee?: ProtoCustomFee) {
        super(fee);

        if (fee != null) {
            const fractionalFee = fee.getFractionalFee();

            if (fractionalFee == null) {
                return;
            }

            const fraction = fractionalFee.getFractionalAmount();

            if (fraction != null) {
                this.numerator = new BigNumber(fraction.getNumerator());
                this.denominator = new BigNumber(fraction.getDenominator());
            }

            this.min = new BigNumber(fractionalFee.getMinimumAmount());
            this.max = new BigNumber(fractionalFee.getMaximumAmount());
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

    public setMin(min: BigNumber): this {
        this.min = min;
        return this;
    }

    public setMax(max: BigNumber): this {
        this.max = max;
        return this;
    }

    // NOT A STABLE API
    public _toProto(): ProtoCustomFee {
        const builder = new ProtoCustomFee();
        const fractionalFeeBuilder = new ProtoFractionalFee();
        const fraction = new ProtoFraction();

        if (this.numerator != null) {
            fraction.setNumerator(this.numerator.toString());
        }

        if (this.denominator != null) {
            fraction.setDenominator(this.denominator.toString());
        }

        if (this.min != null) {
            fractionalFeeBuilder.setMinimumAmount(this.min.toString());
        }

        if (this.max != null) {
            fractionalFeeBuilder.setMaximumAmount(this.max.toString());
        }

        fractionalFeeBuilder.setFractionalAmount(fraction);
        builder.setFractionalFee(fractionalFeeBuilder);

        return builder;
    }
}
