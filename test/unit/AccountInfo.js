import AccountInfo from "../src/account/AccountInfo.js";
import AccountId from "../src/account/AccountId.js";
import Hbar from "../src/Hbar.js";
import { Key } from "@hashgraph/proto";
import Timestamp from "../src/Timestamp.js";
import Duration from "../src/Duration.js";
import TokenRelationshipMap from "../src/account/TokenRelationshipMap.js";
import Long from "long";

/**
 *  sendRecordThreshold and receiveRecordThreshold are deprecated and not included in this test nor toJSON
 */

describe("AccountInfo", function () {
    it("should construct AccountInfo JSON object", function () {
        const props = {};
        props.accountId = new AccountId(1, 1, 1);
        props.contractAccountId = "0000000000000000000000000000000000000001";
        props.isDeleted = false;
        props.proxyAccountId = "0000000000000000000000000000000000000002";
        props.proxyReceived = new Hbar(1);
        props.key = new Key();
        props.balance = new Hbar(1);
        props.isReceiverSignatureRequired = false;
        props.expirationTime = new Timestamp(1, 1);
        props.autoRenewPeriod = new Duration(1);
        props.liveHashes = [];
        props.tokenRelationships = new TokenRelationshipMap();
        props.accountMemo = "This is a memo";
        props.ownedNfts = new Long(1);

        const accountInfo = new AccountInfo(props).toJSON();

        expect(accountInfo["accountId"]).to.eql("1.1.1");
        expect(accountInfo["contractAccountId"]).to.eql(
            "0000000000000000000000000000000000000001"
        );
        expect(accountInfo["isDeleted"]).to.eql(false);
        expect(accountInfo["proxyAccountId"]).to.eql(
            "0000000000000000000000000000000000000002"
        );
        expect(accountInfo["proxyReceived"]).to.eql(new Hbar(1).toString());
        expect(accountInfo["key"]).to.eql(new Key().toString());
        expect(accountInfo["balance"]).to.eql(new Hbar(1).toString());
        expect(accountInfo["isReceiverSignatureRequired"]).to.eql(false);
        expect(accountInfo["expirationTime"]).to.eql(
            new Timestamp(1, 1).toString()
        );
        expect(accountInfo["autoRenewPeriod"]).to.eql(
            new Duration(1).toString()
        );
        expect(accountInfo["liveHashes"]).to.eql([]);
        expect(accountInfo["tokenRelationships"]).to.eql(
            new TokenRelationshipMap().toString()
        );
        expect(accountInfo["accountMemo"]).to.eql("This is a memo");
        expect(accountInfo["ownedNfts"]).to.eql(new Long(1).toString());
    });

    it("should construct string object from AccountInfo JSON", function () {
        const props = {};
        props.accountId = new AccountId(1, 1, 1);
        props.contractAccountId = "0000000000000000000000000000000000000001";
        props.isDeleted = false;
        props.proxyAccountId = "0000000000000000000000000000000000000002";
        props.proxyReceived = new Hbar(1);
        props.key = new Key();
        props.balance = new Hbar(1);
        props.isReceiverSignatureRequired = false;
        props.expirationTime = new Timestamp(1, 1);
        props.autoRenewPeriod = new Duration(1);
        props.liveHashes = [];
        props.tokenRelationships = new TokenRelationshipMap();
        props.accountMemo = "This is a memo";
        props.ownedNfts = new Long(1);

        const accountInfoString = new AccountInfo(props).toString();

        expect(accountInfoString).to.eql(
            '{"accountId":"1.1.1","contractAccountId":"0000000000000000000000000000000000000001","key":"[object Object]","liveHashes":[],"isReceiverSignatureRequired":false,"proxyAccountId":"0000000000000000000000000000000000000002","proxyReceived":"1 ℏ","balance":"1 ℏ","isDeleted":false,"expirationTime":"1.1","autoRenewPeriod":"1","tokenRelationships":"{}","accountMemo":"This is a memo","ownedNfts":"1"}'
        );
    });
});
