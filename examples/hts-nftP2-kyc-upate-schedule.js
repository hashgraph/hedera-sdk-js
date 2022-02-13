console.clear();
require("dotenv").config();

const {
	AccountId,
	PrivateKey,
	Client,
	TokenCreateTransaction,
	TokenInfoQuery,
	TokenType,
	CustomRoyaltyFee,
	CustomFixedFee,
	Hbar,
	TokenSupplyType,
	TokenMintTransaction,
	TokenBurnTransaction,
	TransferTransaction,
	AccountBalanceQuery,
	AccountUpdateTransaction,
	TokenAssociateTransaction,
	TokenUpdateTransaction,
	TokenGrantKycTransaction,
	TokenRevokeKycTransaction,
	ScheduleCreateTransaction,
	ScheduleSignTransaction,
	ScheduleInfoQuery,
	TokenPauseTransaction,
	TokenUnpauseTransaction,
	TokenWipeTransaction,
	TokenFreezeTransaction,
	TokenUnfreezeTransaction,
	TokenDeleteTransaction,
} = require("@hashgraph/sdk");

// Configure accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const treasuryId = AccountId.fromString(process.env.TREASURY_ID);
const treasuryKey = PrivateKey.fromString(process.env.TREASURY_PVKEY);
const aliceId = AccountId.fromString(process.env.ALICE_ID);
const aliceKey = PrivateKey.fromString(process.env.ALICE_PVKEY);
const bobId = AccountId.fromString(process.env.BOB_ID);
const bobKey = PrivateKey.fromString(process.env.BOB_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generate();
const adminKey = PrivateKey.generate();
const kycKey = PrivateKey.generate();
const newKycKey = PrivateKey.generate();
const pauseKey = PrivateKey.generate();
const freezeKey = PrivateKey.generate();
const wipeKey = PrivateKey.generate();

async function main() {
	// DEFINE CUSTOM FEE SCHEDULE
	let nftCustomFee = await new CustomRoyaltyFee()
		.setNumerator(5)
		.setDenominator(10)
		.setFeeCollectorAccountId(treasuryId)
		.setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));

	// IPFS CONTENT IDENTIFIERS FOR WHICH WE WILL CREATE NFTs
	CID = [
		"QmNPCiNA3Dsu3K5FxDPMG5Q3fZRwVTg14EXA92uqEeSRXn",
		"QmZ4dgAgt8owvnULxnKxNe8YqpavtVCXmc1Lt2XajFpJs9",
		"QmPzY5GxevjyfMUF5vEAjtyRoigzWp47MiKAtLBduLMC1T",
		"Qmd3kGgSrAwwSrhesYcY7K54f3qD7MDo38r7Po2dChtQx5",
		"QmWgkKz3ozgqtnvbCLeh7EaR1H8u5Sshx3ZJzxkcrT3jbw",
	];

	// CREATE NFT WITH CUSTOM FEE
	let nftCreate = await new TokenCreateTransaction()
		.setTokenName("Fall Collection")
		.setTokenSymbol("LEAF")
		.setTokenType(TokenType.NonFungibleUnique)
		.setDecimals(0)
		.setInitialSupply(0)
		.setTreasuryAccountId(treasuryId)
		.setSupplyType(TokenSupplyType.Finite)
		.setMaxSupply(CID.length)
		.setCustomFees([nftCustomFee])
		.setAdminKey(adminKey)
		.setSupplyKey(supplyKey)
		.setKycKey(kycKey)
		.setPauseKey(pauseKey)
		.setFreezeKey(freezeKey)
		.setWipeKey(wipeKey)
		.freezeWith(client)
		.sign(treasuryKey);

	let nftCreateTxSign = await nftCreate.sign(adminKey);
	let nftCreateSubmit = await nftCreateTxSign.execute(client);
	let nftCreateRx = await nftCreateSubmit.getReceipt(client);
	let tokenId = nftCreateRx.tokenId;
	console.log(`Created NFT with Token ID: ${tokenId} \n`);

	// TOKEN QUERY TO CHECK THAT THE CUSTOM FEE SCHEDULE IS ASSOCIATED WITH NFT
	var tokenInfo = await tQueryFcn();
	console.table(tokenInfo.customFees[0]);

	// MINT NEW BATCH OF NFTs
	nftLeaf = [];
	for (var i = 0; i < CID.length; i++) {
		nftLeaf[i] = await tokenMinterFcn(CID[i]);
		console.log(`Created NFT ${tokenId} with serial: ${nftLeaf[i].serials[0].low}`);
	}

	// BURN THE LAST NFT IN THE COLLECTION
	let tokenBurnTx = await new TokenBurnTransaction()
		.setTokenId(tokenId)
		.setSerials([CID.length])
		.freezeWith(client)
		.sign(supplyKey);
	let tokenBurnSubmit = await tokenBurnTx.execute(client);
	let tokenBurnRx = await tokenBurnSubmit.getReceipt(client);
	console.log(`\nBurn NFT with serial ${CID.length}: ${tokenBurnRx.status}`);

	var tokenInfo = await tQueryFcn();
	console.log(`Current NFT supply: ${tokenInfo.totalSupply}`);

	// MANUAL ASSOCIATION FOR ALICE'S ACCOUNT
	let associateAliceTx = await new TokenAssociateTransaction()
		.setAccountId(aliceId)
		.setTokenIds([tokenId])
		.freezeWith(client)
		.sign(aliceKey);
	let associateAliceTxSubmit = await associateAliceTx.execute(client);
	let associateAliceRx = await associateAliceTxSubmit.getReceipt(client);
	console.log(`\n- Alice NFT manual association: ${associateAliceRx.status}`);

	// MANUAL ASSOCIATION FOR BOB'S ACCOUNT
	let associateBobTx = await new TokenAssociateTransaction()
		.setAccountId(bobId)
		.setTokenIds([tokenId])
		.freezeWith(client)
		.sign(bobKey);
	let associateBobTxSubmit = await associateBobTx.execute(client);
	let associateBobRx = await associateBobTxSubmit.getReceipt(client);
	console.log(`- Bob NFT manual association: ${associateBobRx.status}`);

	// PART 2.1 STARTS ============================================================
	console.log(`\nPART 2.1 STARTS ============================================================\n`);
	// ENABLE TOKEN KYC FOR ALICE AND BOB
	let aliceKyc = await kycEnableFcn(aliceId);
	let bobKyc = await kycEnableFcn(bobId);
	console.log(`- Enabling token KYC for Alice's account: ${aliceKyc.status}`);
	console.log(`- Enabling token KYC for Bob's account: ${bobKyc.status}\n`);

	// // DISABLE TOKEN KYC FOR ALICE
	// let kycDisableTx = await new TokenRevokeKycTransaction()
	// 	.setAccountId(aliceId)
	// 	.setTokenId(tokenId)
	// 	.freezeWith(client)
	// 	.sign(kycKey);
	// let kycDisableSubmitTx = await kycDisableTx.execute(client);
	// let kycDisableRx = await kycDisableSubmitTx.getReceipt(client);
	// console.log(`- Disabling token KYC for Alice's account: ${kycDisableRx.status} \n`);

	// QUERY TO CHECK INTIAL KYC KEY
	var tokenInfo = await tQueryFcn();
	console.log(`- KYC key for the NFT is: \n${tokenInfo.kycKey.toString()} \n`);

	// UPDATE TOKEN PROPERTIES: NEW KYC KEY
	let tokenUpdateTx = await new TokenUpdateTransaction()
		.setTokenId(tokenId)
		.setKycKey(newKycKey)
		.freezeWith(client)
		.sign(adminKey);
	let tokenUpdateSubmitTx = await tokenUpdateTx.execute(client);
	let tokenUpdateRx = await tokenUpdateSubmitTx.getReceipt(client);
	console.log(`- Token update transaction (new KYC key): ${tokenUpdateRx.status} \n`);

	// QUERY TO CHECK CHANGE IN KYC KEY
	var tokenInfo = await tQueryFcn();
	console.log(`- KYC key for the NFT is: \n${tokenInfo.kycKey.toString()}`);

	// PART 2.1 ENDS ============================================================
	console.log(`\nPART 2.1 ENDS ============================================================\n`);

	// BALANCE CHECK 1
	oB = await bCheckerFcn(treasuryId);
	aB = await bCheckerFcn(aliceId);
	bB = await bCheckerFcn(bobId);
	console.log(`- Treasury balance: ${oB[0]} NFTs of ID: ${tokenId} and ${oB[1]}`);
	console.log(`- Alice balance: ${aB[0]} NFTs of ID: ${tokenId} and ${aB[1]}`);
	console.log(`- Bob balance: ${bB[0]} NFTs of ID: ${tokenId} and ${bB[1]}`);

	// 1st TRANSFER NFT TREASURY -> ALICE
	let tokenTransferTx = await new TransferTransaction()
		.addNftTransfer(tokenId, 2, treasuryId, aliceId)
		.freezeWith(client)
		.sign(treasuryKey);
	let tokenTransferSubmit = await tokenTransferTx.execute(client);
	let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
	console.log(`\n NFT transfer Treasury -> Alice status: ${tokenTransferRx.status} \n`);

	// BALANCE CHECK 2
	oB = await bCheckerFcn(treasuryId);
	aB = await bCheckerFcn(aliceId);
	bB = await bCheckerFcn(bobId);
	console.log(`- Treasury balance: ${oB[0]} NFTs of ID: ${tokenId} and ${oB[1]}`);
	console.log(`- Alice balance: ${aB[0]} NFTs of ID: ${tokenId} and ${aB[1]}`);
	console.log(`- Bob balance: ${bB[0]} NFTs of ID: ${tokenId} and ${bB[1]}`);

	// 2nd NFT TRANSFER NFT ALICE -> BOB
	let tokenTransferTx2 = await new TransferTransaction()
		.addNftTransfer(tokenId, 2, aliceId, bobId)
		.addHbarTransfer(aliceId, 100)
		.addHbarTransfer(bobId, -100)
		.freezeWith(client)
		.sign(aliceKey);
	tokenTransferTx2Sign = await tokenTransferTx2.sign(bobKey);
	let tokenTransferSubmit2 = await tokenTransferTx2Sign.execute(client);
	let tokenTransferRx2 = await tokenTransferSubmit2.getReceipt(client);
	console.log(`\n NFT transfer Alice -> Bob status: ${tokenTransferRx2.status} \n`);

	// BALANCE CHECK 3
	oB = await bCheckerFcn(treasuryId);
	aB = await bCheckerFcn(aliceId);
	bB = await bCheckerFcn(bobId);
	console.log(`- Treasury balance: ${oB[0]} NFTs of ID: ${tokenId} and ${oB[1]}`);
	console.log(`- Alice balance: ${aB[0]} NFTs of ID: ${tokenId} and ${aB[1]}`);
	console.log(`- Bob balance: ${bB[0]} NFTs of ID: ${tokenId} and ${bB[1]}`);

	// PART 2.2 STARTS ============================================================
	console.log(`\nPART 2.2 STARTS ============================================================\n`);

	// CREATE THE NFT TRANSFER FROM BOB->ALICE TO BE SCHEDULED
	// REQUIRES ALICE'S AND BOB'S SIGNATURES
	let txToSchedule = new TransferTransaction()
		.addNftTransfer(tokenId, 2, bobId, aliceId)
		.addHbarTransfer(aliceId, -200)
		.addHbarTransfer(bobId, 200);

	// SCHEDULE THE NFT TRANSFER TRANSACTION CREATED IN THE LAST STEP
	let scheduleTx = await new ScheduleCreateTransaction().setScheduledTransaction(txToSchedule).execute(client);
	let scheduleRx = await scheduleTx.getReceipt(client);
	let scheduleId = scheduleRx.scheduleId;
	let scheduledTxId = scheduleRx.scheduledTransactionId;
	console.log(`- The schedule ID is: ${scheduleId}`);
	console.log(`- The scheduled transaction ID is: ${scheduledTxId} \n`);

	// SUBMIT ALICE'S SIGNATURE FOR THE TRANSFER TRANSACTION
	let aliceSignTx = await new ScheduleSignTransaction().setScheduleId(scheduleId).freezeWith(client).sign(aliceKey);
	let aliceSignSubmit = await aliceSignTx.execute(client);
	let aliceSignRx = await aliceSignSubmit.getReceipt(client);
	console.log(`- Status of Alice's signature submission: ${aliceSignRx.status}`);

	// QUERY TO CONFIRM IF THE SCHEDULE WAS TRIGGERED (SIGNATURES HAVE BEEN ADDED)
	scheduleQuery = await new ScheduleInfoQuery().setScheduleId(scheduleId).execute(client);
	console.log(`- Schedule triggered (all required signatures received): ${scheduleQuery.executed !== null}`);

	// SUBMIT BOB'S SIGNATURE FOR THE TRANSFER TRANSACTION
	let bobSignTx = await new ScheduleSignTransaction().setScheduleId(scheduleId).freezeWith(client).sign(bobKey);
	let bobSignSubmit = await bobSignTx.execute(client);
	let bobSignRx = await bobSignSubmit.getReceipt(client);
	console.log(`- Status of Bob's signature submission: ${bobSignRx.status}`);

	// QUERY TO CONFIRM IF THE SCHEDULE WAS TRIGGERED (SIGNATURES HAVE BEEN ADDED)
	scheduleQuery = await new ScheduleInfoQuery().setScheduleId(scheduleId).execute(client);
	console.log(`- Schedule triggered (all required signatures received): ${scheduleQuery.executed !== null} \n`);

	// VERIFY THAT THE SCHEDULED TRANSACTION (TOKEN TRANSFER) EXECUTED
	oB = await bCheckerFcn(treasuryId);
	aB = await bCheckerFcn(aliceId);
	bB = await bCheckerFcn(bobId);
	console.log(`- Treasury balance: ${oB[0]} NFTs of ID: ${tokenId} and ${oB[1]}`);
	console.log(`- Alice balance: ${aB[0]} NFTs of ID: ${tokenId} and ${aB[1]}`);
	console.log(`- Bob balance: ${bB[0]} NFTs of ID: ${tokenId} and ${bB[1]}`);

	// TOKEN MINTER FUNCTION ==========================================
	async function tokenMinterFcn(CID) {
		mintTx = await new TokenMintTransaction()
			.setTokenId(tokenId)
			.setMetadata([Buffer.from(CID)])
			.freezeWith(client);
		let mintTxSign = await mintTx.sign(supplyKey);
		let mintTxSubmit = await mintTxSign.execute(client);
		let mintRx = await mintTxSubmit.getReceipt(client);
		return mintRx;
	}

	// BALANCE CHECKER FUNCTION ==========================================
	async function bCheckerFcn(id) {
		balanceCheckTx = await new AccountBalanceQuery().setAccountId(id).execute(client);
		return [balanceCheckTx.tokens._map.get(tokenId.toString()), balanceCheckTx.hbars];
	}
	// KYC ENABLE FUNCTION ==========================================
	async function kycEnableFcn(id) {
		let kycEnableTx = await new TokenGrantKycTransaction()
			.setAccountId(id)
			.setTokenId(tokenId)
			.freezeWith(client)
			.sign(kycKey);
		let kycSubmitTx = await kycEnableTx.execute(client);
		let kycRx = await kycSubmitTx.getReceipt(client);
		return kycRx;
	}

	// TOKEN QUERY FUNCTION ==========================================
	async function tQueryFcn() {
		var tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
		return tokenInfo;
	}
}
main();
