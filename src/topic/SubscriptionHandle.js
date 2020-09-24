export default class SubscriptionHandle {
    constructor() {
        /**
         * @type {(() => void) | null}
         */
        this._call = null;
    }

    /**
     * @param {() => void} call
     * @returns {void}
     */
    _setCall(call) {
        this._call = call;
    }

    /**
     * @returns {void}
     */
    unsubscribe() {
        if (this._call != null) {
            this._call();
        }
    }
}
