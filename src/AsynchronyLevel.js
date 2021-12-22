export default class AsynchronyLevel {
    /**
     * @hideconstructor
     * @internal
     * @param {number} code
     */
    constructor(code) {
        /** @readonly */
        this._code = code;

        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {
        switch (this) {
            case AsynchronyLevel.None:
                return "NONE";
            case AsynchronyLevel.Sign:
                return "SIGN";
            case AsynchronyLevel.Build:
                return "BUILD";
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {AsynchronyLevel}
     */
    static _fromCode(code) {
        switch (code) {
            case 0:
                return AsynchronyLevel.None;
            case 1:
                return AsynchronyLevel.Sign;
            case 2:
                return AsynchronyLevel.Build;
            default:
                throw new Error(
                    `(BUG) AsynchronyLevel.fromCode() does not handle code: ${code}`
                );
        }
    }

    /**
     * @returns {boolean} 
     */
    get isNone() {
        return this._code === AsynchronyLevel.None._code;
    }
}

/**
 * Syncrhonously sign and build transactions on `Transaction.freezeWith()`
 */
AsynchronyLevel.None = new AsynchronyLevel(0);

/**
 * Build transactions syncrhonously, but sign them on demand
 */
AsynchronyLevel.Sign = new AsynchronyLevel(1);

/**
 * Build transactions on demand which requires signing on demand
 */
AsynchronyLevel.Build = new AsynchronyLevel(2);
