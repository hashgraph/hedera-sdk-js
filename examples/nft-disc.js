import {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
    AccountBalanceQuery,
    TokenMintTransaction,
    TokenType,
    Hbar,
    Timestamp,
    TransactionId,
} from "@hashgraph/sdk";

import dotenv from "dotenv";
dotenv.config();

import Bottleneck from "bottleneck";
const bottleneck = new Bottleneck();


const main = async () => {
    // Configure accounts and client, and generate needed keys
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

    // If we weren't able to get them, we should throw a new error
    if (operatorId == null || operatorKey == null) {
        throw new Error(
            "Could not fetch 'operatorId' and 'operatorKey' properly"
        );
    }

    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxAttempts(30);
    const privateKey = PrivateKey.generate();

    let client1 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxAttempts(30);
    let client2 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxAttempts(30);
    let client3 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxAttempts(30);
    let client4 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxAttempts(30);
    let client5 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxAttempts(30);
    let client6 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxAttempts(30);
    let client7 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxAttempts(30);

    var nodeClients = [client1, client2, client3, client4, client5, client6, client7];


    const transaction = new TokenCreateTransaction()
        .setTokenName("Your Token Name")
        .setTokenSymbol("F")
        .setTokenType(TokenType.NonFungibleUnique)
        .setTreasuryAccountId(operatorId)
        .setInitialSupply(0)
        .setAdminKey(privateKey)
        .setSupplyKey(privateKey)
        .setMaxTransactionFee(new Hbar(30))
        .freezeWith(client);

    const signTx = await (await transaction.sign(privateKey)).sign(operatorKey);
    const txResponse = await signTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    const data = [
        new Uint8Array(Buffer.from("f44dce5b-3b4d-4ea6-aae9-2549bd30f9a2")),
    ];


    const totalTransactions = 400;
    const bucketSize = 5;
    //if the remainder division between totalTransactions and bucketSize equals 0,
    //we should not add 1 to the floor of division between the two in calculating the number of buckets
    //examples:
    //    Math.floor(395 003 / 5000) == 79 (so we need to add 1 more bucket because of the remaining 3 transactions)
    //    Math.floor(400 000 / 5000) == 80 (there is no need to add 1 more bucket because 400 000 % 5000 equals 0 and there are no transactions left)
    const numberOfBuckets = (totalTransactions % bucketSize == 0) ? Math.floor(totalTransactions / bucketSize)
                                        : Math.floor(totalTransactions / bucketSize) + 1;
    
    let transactionCount = 1;
    let currentBucketMaxTransactionIndex = bucketSize;
    
    console.log(numberOfBuckets);
    
    let promises = [];
    let nanosOffset = 1000000;
    //play with offset a little bit
    console.time('done');
    for (let bucketCount = 1; bucketCount <= numberOfBuckets; bucketCount++) {

        console.log(`bucketCount: ${bucketCount}`);
        //console.log("Execute:", transactionCount);
        //setTimeout(async () => {
        for (let transactionIndex = transactionCount; transactionIndex <= currentBucketMaxTransactionIndex; transactionIndex++) {
            try {
                //prevent the cycle from running after getting the last transaction
                if (transactionIndex > totalTransactions) continue;
                
                
                if (transactionCount == transactionIndex) console.log(`transactionCount: ${transactionCount}`);
                console.log(`transactionIndex: ${transactionIndex}`);
                console.log(`currentBucketMaxTransactionIndex: ${currentBucketMaxTransactionIndex}`);
                

                const clientN =
                    nodeClients[Math.floor(Math.random() * nodeClients.length)];

                const seconds = Math.round(Date.now() / 1000);
                const validStart = new Timestamp(seconds, nanosOffset);
                nanosOffset += 10000;
            
                const transactionId = TransactionId.withValidStart(
                    operatorId,
                    validStart
                );

                const transaction1 = new TokenMintTransaction()
                    .setTransactionId(transactionId)
                    .setTokenId(tokenId)
                    .setTransactionValidDuration(180)
                    .setMetadata(data)
                    .freezeWith(clientN);
                const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxAttempts(30);
                
                //setInterval(() => {
                setTimeout(() => {
                    try {
                        bottleneck.schedule({
                            id: transactionIndex.toString(),
                            weight: 1000
                        }, async () => {
                            console.log("Pushed:", transactionIndex);
                            promises.push(signTx1.execute(clientN));
                            /* promises.push(new Promise((resolve) => {
                                setTimeout(resolve, 7000);
                            })); */
                            return Promise.allSettled(promises);
                        });
                    } catch(error) {
                        console.log(`Bottle error:\n${JSON.stringify(error)} + ${transactionIndex}`);
                    }
                }, bucketCount * 10000);
            } catch(error) {
                console.log(`For error:\n${JSON.stringify(error)} + ${transactionIndex}`);
            }
        }

        /* setImmediate(() => {

        }); */
        /* await new Promise((resolve) => {
            setTimeout(resolve, 7000);
        }); */

        // setting the await period based on the bucket number, 1st bucket will start after 0 * 300000 (immediately), 2nd bucket -> after 1 * 300000 (5 minutes) and so on..
        //}, bucketCount * 10000);

        //clear the list of promises after each bucket execution
        promises = [];
        //increase the transactionCount(transactionIndex) by the size of the buckets
        transactionCount += bucketSize;
        //increase currentBucketMaxTransactionIndex by the size of the buckets
        currentBucketMaxTransactionIndex += bucketSize;
    
        /* setTimeout(async () => {
            await wait(120000);
        }, (bucketCount * 12000) + 500); */
    }
    

    console.timeEnd('done');

    await wait(6000);
    console.log(`Token ID1: ${tokenId}`);
    await wait(12000);
    console.log(`Token ID2: ${tokenId}`);
    await wait(18000);
    console.log(`Token ID3: ${tokenId}`);
    await wait(24000);
    console.log(`Token ID4: ${tokenId}`);
};

async function innerFor(transactionCount, nanosOffset, currentBucketMaxTransactionIndex, totalTransactions) {
    for (let transactionIndex = transactionCount; transactionIndex <= currentBucketMaxTransactionIndex; transactionIndex++) {
                
        //prevent the cycle from running after getting the last transaction
        if (transactionIndex > totalTransactions) continue;
        
        
        if (transactionCount == transactionIndex) console.log(`transactionCount: ${transactionCount}`);
        console.log(`transactionIndex: ${transactionIndex}`);
        console.log(`currentBucketMaxTransactionIndex: ${currentBucketMaxTransactionIndex}`);
        

        const clientN =
            nodeClients[Math.floor(Math.random() * nodeClients.length)];

        const seconds = Math.round(Date.now() / 1000);
        const validStart = new Timestamp(seconds, nanosOffset);
        nanosOffset += 1000;
    
        const transactionId = TransactionId.withValidStart(
            operatorId,
            validStart
        );

        const transaction1 = new TokenMintTransaction()
            .setTransactionId(transactionId)
            .setTokenId(tokenId)
            .setTransactionValidDuration(180)
            .setMetadata(data)
            .freezeWith(clientN);
        const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxAttempts(30);
        
        //setTimeout(() => {
            bottleneck.schedule({
                id: transactionIndex,
                weight: 1000
            }, async () => {
                console.log("Pushed:", transactionIndex);
                promises.push(signTx1.execute(clientN));
                promises.push(wait(12000));
                return Promise.allSettled(promises);
            });
        //}, bucketCount * 5000);
}
}


/**
 * @param {number} timeout
 */
function wait(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

const getBalance = async () => {
    // Configure accounts and client, and generate needed keys
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

    // If we weren't able to get them, we should throw a new error
    if (operatorId == null || operatorKey == null) {
        throw new Error(
            "Could not fetch 'operatorId' and 'operatorKey' properly"
        );
    }

    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    const tokenId = "0.0.48892286"


    let accountBalance = (
        await new AccountBalanceQuery().setAccountId(operatorId).execute(client)
    ).tokens._map
        .get(tokenId)
        .toInt();

    console.log(`Treasury balance: ${accountBalance}`);

    process.exit(0);
}

//getBalance();

main();