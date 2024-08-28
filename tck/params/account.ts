export interface CreateAccountParams {
    readonly key?: string;
    readonly initialBalance?: string;
    readonly receiverSignatureRequired?: boolean;
    readonly maxAutoTokenAssociations?: number;
    readonly commonTransactionParams?: Record<string, any>;
    readonly stakedAccountId?: string;
    readonly stakedNodeId?: number;
    readonly declineStakingReward?: boolean;
    readonly memo?: string;
    readonly autoRenewPeriod?: number;
    readonly alias?: string;
}
