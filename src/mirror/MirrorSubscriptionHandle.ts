type UnsubscribeCall = () => void;

export class MirrorSubscriptionHandle {
    private _call: UnsubscribeCall | null = null;

    public constructor(call?: UnsubscribeCall) {
        if (call != null) {
            this._call = call;
        }
    }

    // NOT A STABLE API
    public _setCall(call: UnsubscribeCall): void {
        this._call = call;
    }

    public unsubscribe(): void {
        if (this._call != null) {
            this._call();
        }
    }
}
