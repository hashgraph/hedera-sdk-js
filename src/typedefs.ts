export type AccountId = { shard: number; realm: number; account: number };

export type TransactionId = {
    account: AccountId;
    validStartSeconds: number;
    validStartNanos: number;
};

export type FileId = {
    shard: number;
    realm: number;
    file: number;
};
