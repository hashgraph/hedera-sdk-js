export class FeeAssessmentMethod {
    public static readonly Inclusive = new FeeAssessmentMethod(false);
    public static readonly Exclusive = new FeeAssessmentMethod(true);

    public readonly code: boolean;

    // NOT A STABLE API
    public constructor(code: boolean) {
        this.code = code;
    }

    public toString(): string {
        switch (this) {
            case FeeAssessmentMethod.Inclusive: return "INCLUSIVE";
            case FeeAssessmentMethod.Exclusive: return "EXCLUSIVE";
            default:
                return `Uknown FeeAssessmentMethod: ${this.code}`;
        }
    }

    public static _fromCode(code: boolean): FeeAssessmentMethod {
        return code ? FeeAssessmentMethod.Exclusive : FeeAssessmentMethod.Inclusive;
    }
}
