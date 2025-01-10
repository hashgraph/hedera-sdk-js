export interface CreateAccountParams {
    readonly key?: string;
    readonly initialBalance?: string;
    readonly receiverSignatureRequired?: boolean;
    readonly maxAutoTokenAssociations?: number;
    readonly commonTransactionParams?: Record<string, any>;
    readonly stakedAccountId?: string;
    readonly stakedNodeId?: string;
    readonly declineStakingReward?: boolean;
    readonly memo?: string;
    readonly autoRenewPeriod?: string;
    readonly alias?: string;
}

export interface UpdateAccountParams {
    readonly accountId?: string;
    readonly key?: string;
    readonly autoRenewPeriod?: string;
    readonly expirationTime?: string;
    readonly receiverSignatureRequired?: boolean;
    readonly memo?: string;
    readonly maxAutoTokenAssociations?: number;
    readonly stakedAccountId?: string;
    readonly stakedNodeId?: string;
    readonly declineStakingReward?: boolean;
    readonly commonTransactionParams?: Record<string, any>;
}

export interface DeleteAccountParams {
    readonly deleteAccountId?: string;
    readonly transferAccountId?: string;
    readonly commonTransactionParams?: Record<string, any>;
}
