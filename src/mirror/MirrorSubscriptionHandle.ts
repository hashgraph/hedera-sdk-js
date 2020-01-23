type UnsubscribeCall = () => void;

export class MirrorSubscriptionHandle {
    private readonly call: UnsubscribeCall;

    public constructor(call: UnsubscribeCall) {
        this.call = call;
    }

    public unsubscribe(): void {
        this.call();
    }
}
