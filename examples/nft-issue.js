import {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
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
    client.setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxBackoff(120000);
    const privateKey = PrivateKey.generate();

    let client1 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxBackoff(120000);
    let client2 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxBackoff(120000);
    let client3 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxBackoff(120000);
    let client4 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxBackoff(120000);
    let client5 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxBackoff(120000);
    let client6 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxBackoff(120000);
    let client7 = Client.forTestnet().setOperator(operatorId, operatorKey).setMinBackoff(1).setMaxBackoff(120000);

    var nodeClients = [
        client1,
        client2,
        client3,
        client4,
        client5,
        client6,
        client7,
    ];

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


    const MAX = 400_000;
    let failed = [];
    console.time('done');
    let count = 0;
    let promises = [];
    let nanosOffset = 1000000;
    for (let i = 0; i < 5000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            //-----------------------GROUP APPROACH-----------------------
            /* if (i >= 1000 && i < 2000)
                bottleneckId = 2;
            if (i >= 2000 && i < 3000)
                bottleneckId = 3;
            if (i >= 3000 && i < 4000)
                bottleneckId = 4;
            if (i >= 4000 && i < 5000)
                bottleneckId = 5;
            if (i >= 5000 && i < 6000)
                bottleneckId = 6;
            if (i >= 6000 && i < 7000)
                bottleneckId = 7;
            if (i >= 7000 && i < 8000)
                bottleneckId = 8;
            if (i >= 8000 && i < 9000)
                bottleneckId = 9;
            if (i >= 9000 && i < 10000)
                bottleneckId = 10;

            console.log(`bottleneckId: ${bottleneckId}`)
            group.key(bottleneckId.toString()).schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            }); */

            /*
            //-----------------------BATCHER APPROACH-----------------------
            batcher.add(signTx1.execute(clientN)); */

            //-----------------------PROMISE.ALL APPROACH-----------------------
            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
            
            /* 
            //-----------------------EXECUTE ONE BY ONE APPROACH-----------------------
            bottleneck.schedule({
                id: i
            }, async () => {
                console.log('Pushed:', i);
                signTx1.execute(clientN);
            }); */

            /*
            //-----------------------HOOK APPROACH-----------------------
            signTx1.execute(clientN).then((txResponse1)=>{
                console.log('Executed:', i);
                count++;
                if(count==MAX) {
                    console.timeEnd('success');
                }
            }, (error)=>{
                count++
                console.log(error);
                if(count==MAX) {
                    console.timeEnd('mint error');
                }
            }); */

        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        } 
    }
    
    await wait(240000);
    promises = [];

    for (let i = 5000; i < 10000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);

            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }
    
    await wait(240000);
    promises = [];

    for (let i = 10000; i < 15000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }
    
    await wait(240000);
    promises = [];

    for (let i = 15000; i < 20000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }
    
    await wait(240000);
    promises = [];
    
    for (let i = 20000; i < 25000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 25000; i < 30000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 30000; i < 35000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 35000; i < 40000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 40000; i < 45000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 45000; i < 50000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 50000; i < 55000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 55000; i < 60000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 60000; i < 65000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 65000; i < 70000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 70000; i < 75000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 75000; i < 80000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 80000; i < 85000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 85000; i < 90000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 90000; i < 95000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 95000; i < 100000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 100000; i < 105000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 105000; i < 110000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 110000; i < 115000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 115000; i < 120000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 120000; i < 125000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 125000; i < 130000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 130000; i < 135000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 135000; i < 140000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 140000; i < 145000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 145000; i < 150000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 150000; i < 155000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 155000; i < 160000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 160000; i < 165000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 165000; i < 170000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 170000; i < 175000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 175000; i < 180000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 180000; i < 185000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 185000; i < 190000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 190000; i < 195000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 195000; i < 200000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 200000; i < 205000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 205000; i < 210000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 210000; i < 215000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 215000; i < 220000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 220000; i < 225000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 225000; i < 230000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 230000; i < 235000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 235000; i < 240000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 240000; i < 245000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 245000; i < 250000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 250000; i < 255000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 255000; i < 260000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 260000; i < 265000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 265000; i < 270000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 270000; i < 275000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 275000; i < 280000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 280000; i < 285000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 285000; i < 290000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 290000; i < 295000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 295000; i < 300000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 300000; i < 305000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 305000; i < 310000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 310000; i < 315000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 315000; i < 320000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 320000; i < 325000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 325000; i < 330000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 330000; i < 335000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 335000; i < 340000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 340000; i < 345000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 345000; i < 350000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 350000; i < 355000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 355000; i < 360000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 360000; i < 365000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 365000; i < 370000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 370000; i < 375000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 375000; i < 380000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 380000; i < 385000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 385000; i < 390000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 390000; i < 395000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    promises = [];
    
    for (let i = 395000; i < 400000; i++) {
        try {
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
            const signTx1 = (await transaction1.sign(privateKey)).setMinBackoff(1).setMaxBackoff(120000).setMaxAttempts(30);
            console.log("Execute:", i);


            bottleneck.schedule({
                id: i.toString(),
                weight: 1000
            }, async () => {
                console.log('Pushed:', i);
                promises.push(signTx1.execute(clientN));
                return Promise.allSettled(promises);
            });
        } catch(error) {
            console.log(`${JSON.stringify(error)} + ${i}`);
        }
    }

    await wait(240000);
    console.log("failed\n");
    console.log(JSON.stringify(failed));

    console.timeEnd('done');

    /* let outcomes = await Promise.allSettled(promises);

    const succeeded = outcomes.filter((o) => o.status === "fulfilled");
    const succeededR = succeeded.map((s) => s.value);
    const failed = outcomes.filter((o) => o.status === "rejected");
    const failedR = failed.map((f) => f.reason);

    console.log(
        `succeeded records: ${succeededR.length}:\n ${succeededR.toString()}`
    );
    console.log(`failed records: ${failedR.length}:\n ${failedR}`); */



    
    bottleneck.on("error", async (error, jobInfo) => {
        console.log(`Job ${jobInfo.options.id} -> error: ${JSON.stringify(error)}`);
    });
    
    bottleneck.on("failed", async (error, jobInfo) => {
        console.warn(`Job ${jobInfo.options.id} failed: ${error}`);
      
        if (jobInfo.retryCount === 0) { // Here we only retry once
          console.log(`Retrying job ${jobInfo.options.id} in 25ms!`);
          return 25;
        }
    });
    
    bottleneck.on("retry", async (message, jobInfo) => {
        console.log(`Now retrying ${jobInfo.options.id} with message: ${message}`);
    });

    bottleneck.on("idle", async () => {
        console.log(`On IDLE Token ID: ${tokenId}`);
    });



    let failedPromises = [];

    bottleneck.on("debug", async (message, data) => {
        console.log(`message: ${message}`);
        console.log(`data: ${JSON.stringify(data)}`);
        if (data.retryCount == 0) {
            count++;
            failedPromises.push(data.options.id);
        }
    });


    await wait(180000);
    console.log(`Count: ${count}`);
    console.log(`Token ID1: ${tokenId}`);
    await wait(210000);
    console.log(`Count: ${count}`);
    console.log(`Token ID2: ${tokenId}`);



    /* let outcomes = await Promise.allSettled(promises);

    const succeeded = outcomes.filter((o) => o.status === "fulfilled");
    const succeededR = succeeded.map((s) => s.value);
    const failed = outcomes.filter((o) => o.status === "rejected");
    const failedR = failed.map((f) => f.reason);

    console.log(
        `succeeded records: ${succeededR.length}:\n ${succeededR.toString()}`
    );
    console.log(`failed records: ${failedR.length}:\n ${failedR}`);

    await wait(10000);

    let accountBalance2 = (
        await new AccountBalanceQuery().setAccountId(operatorId).execute(client)
    ).tokens._map
        .get(tokenId.toString())
        .toInt();

    console.log(`Treasury balance: ${accountBalance2}`);
    console.log(`count: ${count}`); */
};



/**
 * @param {number} timeout
 */
function wait(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

main();