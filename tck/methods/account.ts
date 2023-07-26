import {
    AccountInfoQuery,
    AccountCreateTransaction,
    PublicKey,
    Hbar,
    AccountUpdateTransaction,
    AccountDeleteTransaction,
    TransferTransaction,
    PrivateKey,
    AccountId
  } from "@hashgraph/sdk";
  import { sdk } from "../sdk_data";
  import LosslessJSON from "lossless-json";
  
  export const createAccountFromAlias = async ({
    operator_id,
    aliasAccountId,
    initialBalance
  }: {
    operator_id: string;
    aliasAccountId: string;
    initialBalance: number;
  }) => {
    const alias_id = JSON.parse(aliasAccountId);
    const response = await new TransferTransaction()
      .addHbarTransfer(operator_id, new Hbar(initialBalance).negated())
      .addHbarTransfer(alias_id, new Hbar(initialBalance))
      .execute(sdk.getClient());
    return await response.getReceipt(sdk.getClient());
  };
  
  /**
   * Create account
   *
   * @param publicKey required
   * @param initialBalance optional
   * @param receiverSignatureRequired optional
   * @param maxAutomaticTokenAssociations optional
   * @param stakedAccountId optional
   * @param stakedNodeId optional
   * @param declineStakingReward optional
   * @param accountMemo optional
   * @param privateKey optional (used for signing)
   * @param autoRenewPeriod optional
   * @returns {Promise<any>}
   */
  export const createAccount = async ({
    publicKey,
    initialBalance,
    receiverSignatureRequired,
    maxAutomaticTokenAssociations,
    stakedAccountId,
    stakedNodeId,
    declineStakingReward,
    accountMemo,
    privateKey,
    autoRenewPeriod
  }: {
    publicKey?: string;
    initialBalance?: number;
    receiverSignatureRequired?: boolean;
    maxAutomaticTokenAssociations?: number;
    stakedAccountId?: string;
    stakedNodeId?: string;
    declineStakingReward?: boolean;
    accountMemo?: string;
    privateKey?: string;
    autoRenewPeriod?: string;
  }) => {
    let transaction = new AccountCreateTransaction();
  
    if (publicKey != null) transaction.setKey(PublicKey.fromString(publicKey));
    if (initialBalance != null)
      transaction.setInitialBalance(
        Hbar.fromTinybars(
          LosslessJSON.parse(`{"long":${initialBalance}}`).long
        )
      );
    if (receiverSignatureRequired != null)
      transaction.setReceiverSignatureRequired(receiverSignatureRequired);
    if (maxAutomaticTokenAssociations != null)
      transaction.setMaxAutomaticTokenAssociations(maxAutomaticTokenAssociations);
    if (stakedAccountId != null)
      transaction.setStakedAccountId(AccountId.fromString(stakedAccountId));
    if (stakedNodeId != null)
      transaction.setStakedNodeId(parseInt(stakedNodeId));
    if (declineStakingReward != null)
      transaction.setDeclineStakingReward(declineStakingReward);
    if (accountMemo != null) transaction.setAccountMemo(accountMemo);
    if (autoRenewPeriod != null)
      transaction.setAutoRenewPeriod(parseInt(autoRenewPeriod));
    if (privateKey != null) {
      transaction.freezeWith(sdk.getClient());
     // transaction = await transaction.sign(PrivateKey.fromString(privateKey));
    }
    const txResponse = await transaction.execute(sdk.getClient());
    const receipt = await txResponse.getReceipt(sdk.getClient());
    return {
      accountId: receipt.accountId.toString(),
      status: receipt.status.toString()
    };
  };
  
  export const getAccountInfo = async ({ accountId }: { accountId: string }) => {
    const query = new AccountInfoQuery().setAccountId(accountId);
    const accountInfo = await query.execute(sdk.getClient());
    return {
      accountId: accountInfo.accountId.toString(),
      balance: accountInfo.balance.toString(),
      key: accountInfo.key.toString(),
      accountMemo: accountInfo.accountMemo.toString(),
      maxAutomaticTokenAssociations: accountInfo.maxAutomaticTokenAssociations,
      autoRenewPeriod: accountInfo.autoRenewPeriod.toString()
    };
  };
  
  export const updateAccountKey = async ({
    accountId,
    newPublicKey,
    oldPrivateKey,
    newPrivateKey
  }: {
    accountId: string;
    newPublicKey: string;
    oldPrivateKey: string;
    newPrivateKey: string;
  }) => {
    const transaction = new AccountUpdateTransaction()
      .setAccountId(AccountId.fromString(accountId))
      .setKey(PublicKey.fromString(newPublicKey))
      .freezeWith(sdk.getClient());
  
    const signTx = await (
      await transaction.sign(PrivateKey.fromString(oldPrivateKey))
    ).sign(PrivateKey.fromString(newPrivateKey));
  
    const txResponse = await signTx.execute(sdk.getClient());
    const receipt = await txResponse.getReceipt(sdk.getClient());
    return {
      status: receipt.status.toString()
    };
  };
  
  export const updateAccountMemo = async ({
    accountId,
    key,
    memo
  }: {
    accountId: string;
    key: string;
    memo: string;
  }) => {
    const transaction = new AccountUpdateTransaction()
      .setAccountId(AccountId.fromString(accountId))
      .setAccountMemo(memo)
      .freezeWith(sdk.getClient());
  
    const signTx = await transaction.sign(PrivateKey.fromString(key));
    const txResponse = await signTx.execute(sdk.getClient());
    const receipt = await txResponse.getReceipt(sdk.getClient());
    return {
      status: receipt.status.toString()
    };
  };
  
  export const deleteAccount = async ({
    accountId,
    accountKey,
    recipientId
  }: {
    accountId: string;
    accountKey: string;
    recipientId: string;
  }) => {
    const transaction = new AccountDeleteTransaction()
      .setAccountId(AccountId.fromString(accountId))
      .setTransferAccountId(AccountId.fromString(recipientId))
      .freezeWith(sdk.getClient());
  
    const signTx = await transaction.sign(PrivateKey.fromString(accountKey));
    const txResponse = await signTx.execute(sdk.getClient());
    const receipt = await txResponse.getReceipt(sdk.getClient());
    return {
      status: receipt.status.toString()
    };
  };
  