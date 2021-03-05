// import {
//     AccountCreateTransaction,
//     ScheduleDeleteTransaction,
//     ScheduleInfoQuery,
//     PrivateKey,
//     AccountId,
//     Hbar,
// } from "../src/exports.js";
// import newClient from "./client/index.js";

describe("ScheduleCreate", function () {
    it("should be executable", async function () {
        // this.timeout(15000);

        // const client = await newClient();
        // const operatorKey = client.operatorPublicKey;
        // const operatorId = client.operatorAccountId;

        // const key = PrivateKey.generate();

        // const transaction = await new AccountCreateTransaction()
        //     .setInitialBalance(new Hbar(10))
        //     .setKey(key.publicKey)
        //     .setNodeAccountIds([new AccountId(3)])
        //     .freezeWith(client);

        // // let response = await new ScheduleCreateTransaction()
        // let response = await transaction
        //     .schedule()
        //     .setPayerAccountId(operatorId)
        //     .setAdminKey(operatorKey)
        //     .execute(client);

        // let receipt = await response.getReceipt(client);

        // expect(receipt.scheduleId).to.not.be.null;
        // expect(receipt.scheduleId != null ? receipt.scheduleId.num > 0 : false)
        //     .to.be.true;

        // const schedule = receipt.scheduleId;

        // const info = await new ScheduleInfoQuery()
        //     .setScheduleId(schedule)
        //     .setNodeAccountIds([response.nodeId])
        //     .execute(client);

        // info.getTransaction();

        // await (
        //     await new ScheduleDeleteTransaction()
        //         .setScheduleId(schedule)
        //         .setNodeAccountIds([response.nodeId])
        //         .execute(client)
        // ).getReceipt(client);
    });
});
