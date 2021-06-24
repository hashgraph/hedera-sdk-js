/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").HederaFunctionality} proto.HederaFunctionality
 */

 export default class RequestType {
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
        switch(this) {
            case 0:
                return
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {RequestType}
     */
    static _fromCode(code) {
        switch (code) {

        }
        throw new Error(
            `(BUG) RequestType.fromCode() does not handle code: ${code}`
        );
    }

    /**
     * @returns {proto.HederaFunctionality}
     */
    valueOf() {
        return this._code;
    }
}

//UNSPECIFIED
RequestType.NONE = new RequestType(0);

RequestType.CryptoTransfer = new RequestType(1); // crypto transfer

RequestType.CryptoUpdate = new RequestType(2); // crypto update account

RequestType.CryptoDelete = new RequestType(3); // crypto delete account


// Add a livehash to a crypto account
RequestType.CryptoAddLiveHash = new RequestType(4);

// Delete a livehash from a crypto account
RequestType.CryptoDeleteLiveHash = new RequestType(5);

RequestType.ContractCall = new RequestType(6); // Smart Contract Call

RequestType.ContractCreate = new RequestType(7); // Smart Contract Create Contract

RequestType.ContractUpdate = new RequestType(8); // Smart Contract update contract

RequestType.FileCreate = new RequestType(9); // File Operation create file

RequestType.FileAppend = new RequestType(10); // File Operation append file

RequestType.FileUpdate = new RequestType(11); // File Operation update file

RequestType.FileDelete = new RequestType(12); // File Operation delete file

RequestType.CryptoGetAccountBalance = new RequestType(13); // crypto get account balance

RequestType.CryptoGetAccountRecords = new RequestType(14); // crypto get account record

RequestType.CryptoGetInfo = new RequestType(15); // Crypto get info

RequestType.ContractCallLocal = new RequestType(16); // Smart Contract Call

RequestType.ContractGetInfo = new RequestType(17); // Smart Contract get info

RequestType.ContractGetBytecode = new RequestType(18); // Smart Contract, get the byte code

RequestType.GetBySolidityID = new RequestType(19); // Smart Contract, get by solidity ID

RequestType.GetByKey = new RequestType(20); // Smart Contract, get by key


// Get a live hash from a crypto account
RequestType.CryptoGetLiveHash = new RequestType(21);

RequestType.CryptoGetStakers = new RequestType(22); // Crypto, get the stakers for the node

RequestType.FileGetContents = new RequestType(23); // File Operations get file contents

RequestType.FileGetInfo = new RequestType(24); // File Operations get the info of the file

RequestType.TransactionGetRecord = new RequestType(25); // Crypto get the transaction records

RequestType.ContractGetRecords = new RequestType(26); // Contract get the transaction records

RequestType.CryptoCreate = new RequestType(27); // crypto create account

RequestType.SystemDelete = new RequestType(28); // system delete file

RequestType.SystemUndelete = new RequestType(29); // system undelete file

RequestType.ContractDelete = new RequestType(30); // delete contract

RequestType.Freeze = new RequestType(31); // freeze

RequestType.CreateTransactionRecord = new RequestType(32); // Create Tx Record

RequestType.CryptoAccountAutoRenew = new RequestType(33); // Crypto Auto Renew

RequestType.ContractAutoRenew = new RequestType(34); // Contract Auto Renew

RequestType.GetVersionInfo = new RequestType(35); //Get Version

RequestType.TransactionGetReceipt = new RequestType(36); // Transaction Get Receipt

RequestType.ConsensusCreateTopic = new RequestType(50); // Create Topic

RequestType.ConsensusUpdateTopic = new RequestType(51); // Update Topic

RequestType.ConsensusDeleteTopic = new RequestType(52); // Delete Topic

RequestType.ConsensusGetTopicInfo = new RequestType(53); // Get Topic information

RequestType.ConsensusSubmitMessage = new RequestType(54); // Submit message to topic

RequestType.UncheckedSubmit = new RequestType(55);

RequestType.TokenCreate = new RequestType(56); // Create Token

RequestType.TokenGetInfo = new RequestType(58); // Get Token information

RequestType.TokenFreezeAccount = new RequestType(59); // Freeze Account

RequestType.TokenUnfreezeAccount = new RequestType(60); // Unfreeze Account

RequestType.TokenGrantKycToAccount = new RequestType(61); // Grant KYC to Account

RequestType.TokenRevokeKycFromAccount = new RequestType(62); // Revoke KYC from Account

RequestType.TokenDelete = new RequestType(63); // Delete Token

RequestType.TokenUpdate = new RequestType(64); // Update Token

RequestType.TokenMint = new RequestType(65); // Mint tokens to treasury

RequestType.TokenBurn = new RequestType(66); // Burn tokens from treasury

RequestType.TokenAccountWipe = new RequestType(67); // Wipe token amount from Account holder

RequestType.TokenAssociateToAccount = new RequestType(68); // Associate tokens to an account

RequestType.TokenDissociateFromAccount = new RequestType(69); // Dissociate tokens from an account

RequestType.ScheduleCreate = new RequestType(70); // Create Scheduled Transaction

RequestType.ScheduleDelete = new RequestType(71); // Delete Scheduled Transaction

RequestType.ScheduleSign = new RequestType(72); // Sign Scheduled Transaction

RequestType.ScheduleGetInfo = new RequestType(73)); // Get Scheduled Transaction Information





