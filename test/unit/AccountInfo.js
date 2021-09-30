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

        const accountInfoJSON = {
            "accountId":props.accountId.toString(),
            "contractAccountId":props.contractAccountId,
            "isDeleted":props.isDeleted,
            "proxyAccountId":props.proxyAccountId,
            "proxyReceived":props.proxyReceived.toString(),
            "key":props.key,
            "balance":props.balance.toString(),
            "isReceiverSignatureRequired":props.isReceiverSignatureRequired,
            "expirationTime":props.expirationTime.toString(),
            "autoRenewPeriod":props.autoRenewPeriod.toString(),
            "liveHashes":props.liveHashes,
            "tokenRelationships":props.tokenRelationships,
            "accountMemo":props.accountMemo,
            "ownedNfts":props.ownedNfts.toString(),
        }

        const accountInfo = new AccountInfo(props).toJSON();

        expect(accountInfo).to.eql(accountInfoJSON);
    });

    it("should construct string object from AccountInfo JSON", function () {
        const accountInfoString = '{"accountId":"1.1.1","contractAccountId":"0000000000000000000000000000000000000001","key":{},"liveHashes":[],"isReceiverSignatureRequired":false,"proxyAccountId":"0000000000000000000000000000000000000002","proxyReceived":"1 ℏ","balance":"1 ℏ","isDeleted":false,"expirationTime":"1.1","autoRenewPeriod":"1","tokenRelationships":{"_map":{},"__map":{}},"accountMemo":"This is a memo","ownedNfts":"1"}';
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

        const accountInfo = new AccountInfo(props).toString();

        expect(accountInfo).to.eql(accountInfoString);
    });

    it("should construct AccountInfo from fromString", function () {
        const accountInfoString = '{"accountId":"1.1.1","contractAccountId":"0000000000000000000000000000000000000001","key":{},"liveHashes":[],"isReceiverSignatureRequired":false,"proxyAccountId":"0000000000000000000000000000000000000002","proxyReceived":"1 ℏ","balance":"1 ℏ","isDeleted":false,"expirationTime":"1.1","autoRenewPeriod":"1","tokenRelationships":{"_map":{},"__map":{}},"accountMemo":"This is a memo","ownedNfts":"1"}';
        const accountInfo = AccountInfo.fromString(accountInfoString).toString();

        expect(accountInfo).to.eql(accountInfoString);
    }); 

    it("should construct AccountInfo from fromJSON", function () {
        const accountInfoJSON = {"accountId":"1.1.1","contractAccountId":"0000000000000000000000000000000000000001","key":{},"liveHashes":[],"isReceiverSignatureRequired":false,"proxyAccountId":"0000000000000000000000000000000000000002","proxyReceived":"1 ℏ","balance":"1 ℏ","isDeleted":false,"expirationTime":"1.1","autoRenewPeriod":"1","tokenRelationships":{"_map":{},"__map":{}},"accountMemo":"This is a memo","ownedNfts":"1"};
        const accountInfo = AccountInfo.fromJSON(accountInfoJSON);

        expect(JSON.stringify(accountInfoJSON)).to.eql(accountInfo.toString());
    }); 
});
