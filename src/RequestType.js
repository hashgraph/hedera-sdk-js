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
           case this:
               return ''
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

// UNSPECIFIED
RequestType.NONE = new RequestType(0);

// Crypto transfer
RequestType.CryptoTransfer = new RequestType(1);

// Crypto update account
RequestType.CryptoUpdate = new RequestType(2); 

// Crypto delete account
RequestType.CryptoDelete = new RequestType(3); 

// Add a livehash to a crypto account
RequestType.CryptoAddLiveHash = new RequestType(4);

// Delete a livehash from a crypto account
RequestType.CryptoDeleteLiveHash = new RequestType(5);

// Smart Contract Call
RequestType.ContractCall = new RequestType(6); 

// Smart Contract Create Contract
RequestType.ContractCreate = new RequestType(7); 

// Smart Contract update contract
RequestType.ContractUpdate = new RequestType(8); 

// File Operation create file
RequestType.FileCreate = new RequestType(9); 

// File Operation append file
RequestType.FileAppend = new RequestType(10); 

// File Operation update file
RequestType.FileUpdate = new RequestType(11); 

// File Operation delete file
RequestType.FileDelete = new RequestType(12); 

// Crypto get account balance
RequestType.CryptoGetAccountBalance = new RequestType(13); 

// Crypto get account record
RequestType.CryptoGetAccountRecords = new RequestType(14); 

// Crypto get info
RequestType.CryptoGetInfo = new RequestType(15); 

// Smart Contract Call
RequestType.ContractCallLocal = new RequestType(16); 

// Smart Contract get info
RequestType.ContractGetInfo = new RequestType(17); 

// Smart Contract, get the byte code
RequestType.ContractGetBytecode = new RequestType(18); 

// Smart Contract, get by solidity ID
RequestType.GetBySolidityID = new RequestType(19); 

// Smart Contract, get by key
RequestType.GetByKey = new RequestType(20); 

// Get a live hash from a crypto account
RequestType.CryptoGetLiveHash = new RequestType(21);

// Crypto, get the stakers for the node
RequestType.CryptoGetStakers = new RequestType(22); 

// File Operations get file contents
RequestType.FileGetContents = new RequestType(23); 

// File Operations get the info of the file
RequestType.FileGetInfo = new RequestType(24); 

// Crypto get the transaction records
RequestType.TransactionGetRecord = new RequestType(25); 

// Contract get the transaction records
RequestType.ContractGetRecords = new RequestType(26); 

// Crypto create account
RequestType.CryptoCreate = new RequestType(27); 

// System delete file
RequestType.SystemDelete = new RequestType(28); 

// System undelete file
RequestType.SystemUndelete = new RequestType(29); 

// Delete contract
RequestType.ContractDelete = new RequestType(30); 

// Freeze
RequestType.Freeze = new RequestType(31); 

// Create Tx Record
RequestType.CreateTransactionRecord = new RequestType(32); 

// Crypto Auto Renew
RequestType.CryptoAccountAutoRenew = new RequestType(33); 

// Contract Auto Renew
RequestType.ContractAutoRenew = new RequestType(34); 

// Get Version
RequestType.GetVersionInfo = new RequestType(35); 

// Transaction Get Receipt
RequestType.TransactionGetReceipt = new RequestType(36); 

// Create Topic
RequestType.ConsensusCreateTopic = new RequestType(50); 

// Update Topic
RequestType.ConsensusUpdateTopic = new RequestType(51); 

// Delete Topic
RequestType.ConsensusDeleteTopic = new RequestType(52); 

// Get Topic information
RequestType.ConsensusGetTopicInfo = new RequestType(53); 

// Submit message to topic
RequestType.ConsensusSubmitMessage = new RequestType(54); 


RequestType.UncheckedSubmit = new RequestType(55);

// Create Token
RequestType.TokenCreate = new RequestType(56); 

// Get Token information
RequestType.TokenGetInfo = new RequestType(58); 

// Freeze Account
RequestType.TokenFreezeAccount = new RequestType(59); 

// Unfreeze Account
RequestType.TokenUnfreezeAccount = new RequestType(60); 

// Grant KYC to Account
RequestType.TokenGrantKycToAccount = new RequestType(61); 

// Revoke KYC from Account
RequestType.TokenRevokeKycFromAccount = new RequestType(62); 

// Delete Token
RequestType.TokenDelete = new RequestType(63); 

// Update Token
RequestType.TokenUpdate = new RequestType(64); 

// Mint tokens to treasury
RequestType.TokenMint = new RequestType(65); 

// Burn tokens from treasury
RequestType.TokenBurn = new RequestType(66); 

// Wipe token amount from Account holder
RequestType.TokenAccountWipe = new RequestType(67); 

// Associate tokens to an account
RequestType.TokenAssociateToAccount = new RequestType(68); 

// Dissociate tokens from an account
RequestType.TokenDissociateFromAccount = new RequestType(69); 

// Create Scheduled Transaction
RequestType.ScheduleCreate = new RequestType(70); 

// Delete Scheduled Transaction
RequestType.ScheduleDelete = new RequestType(71); 

// Sign Scheduled Transaction
RequestType.ScheduleSign = new RequestType(72); 

// Get Scheduled Transaction Information
RequestType.ScheduleGetInfo = new RequestType(73); 





