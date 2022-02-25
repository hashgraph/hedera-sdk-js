import { expect } from "chai";

import { LedgerId } from "../../src/exports.js";
import * as hex from "../../src/encoding/hex.js";

const MAINNET = "mainnet";
const HEX_MAINNET = hex.encode(new Uint8Array([0]));

const TESTNET = "testnet";
const HEX_TESTNET = hex.encode(new Uint8Array([1]));

const PREVIEWNET = "previewnet";
const HEX_PREVIEWNET = hex.encode(new Uint8Array([2]));

const OTHER = "other";
const HEX_OTHER = hex.encode(new Uint8Array([3]));

describe("LedgerId", function () {
    it('fromString returns LedgerId from strings/hex "mainnet", "testnet", "previewnet"', function () {
        expect(LedgerId.fromString(MAINNET).toString()).to.eql(MAINNET);
        expect(LedgerId.fromString(MAINNET).isMainnet()).to.eql(true);
        expect(LedgerId.fromString(MAINNET).isTestnet()).to.eql(false);
        expect(LedgerId.fromString(MAINNET).isPreviewnet()).to.eql(false);

        expect(LedgerId.fromString(HEX_MAINNET).toString()).to.eql(MAINNET);
        expect(LedgerId.fromString(HEX_MAINNET).isMainnet()).to.eql(true);
        expect(LedgerId.fromString(HEX_MAINNET).isTestnet()).to.eql(false);
        expect(LedgerId.fromString(HEX_MAINNET).isPreviewnet()).to.eql(false);

        expect(LedgerId.fromString(TESTNET).toString()).to.eql(TESTNET);
        expect(LedgerId.fromString(TESTNET).isMainnet()).to.eql(false);
        expect(LedgerId.fromString(TESTNET).isTestnet()).to.eql(true);
        expect(LedgerId.fromString(TESTNET).isPreviewnet()).to.eql(false);

        expect(LedgerId.fromString(HEX_TESTNET).toString()).to.eql(TESTNET);
        expect(LedgerId.fromString(HEX_TESTNET).isMainnet()).to.eql(false);
        expect(LedgerId.fromString(HEX_TESTNET).isTestnet()).to.eql(true);
        expect(LedgerId.fromString(HEX_TESTNET).isPreviewnet()).to.eql(false);

        expect(LedgerId.fromString(PREVIEWNET).toString()).to.eql(PREVIEWNET);
        expect(LedgerId.fromString(PREVIEWNET).isMainnet()).to.eql(false);
        expect(LedgerId.fromString(PREVIEWNET).isTestnet()).to.eql(false);
        expect(LedgerId.fromString(PREVIEWNET).isPreviewnet()).to.eql(true);

        expect(LedgerId.fromString(HEX_PREVIEWNET).toString()).to.eql(
            PREVIEWNET
        );
        expect(LedgerId.fromString(HEX_PREVIEWNET).isMainnet()).to.eql(false);
        expect(LedgerId.fromString(HEX_PREVIEWNET).isTestnet()).to.eql(false);
        expect(LedgerId.fromString(HEX_PREVIEWNET).isPreviewnet()).to.eql(true);

        try {
            LedgerId.fromString(OTHER);
        } catch (error) {
            expect(error.message).to.eql("Default reached for fromString");
        }

        expect(LedgerId.fromString(HEX_OTHER).toString()).to.eql("03");
        expect(LedgerId.fromString(HEX_OTHER).isMainnet()).to.eql(false);
        expect(LedgerId.fromString(HEX_OTHER).isTestnet()).to.eql(false);
        expect(LedgerId.fromString(HEX_OTHER).isPreviewnet()).to.eql(false);
    });

    it("isMainnet|Testnet|Previewnet|Other returns boolean", function () {
        let ledgerId = LedgerId.fromString("0");
        expect(ledgerId.isMainnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);
        ledgerId = LedgerId.fromString(MAINNET);
        expect(ledgerId.isMainnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);
        ledgerId = LedgerId.fromBytes(new Uint8Array([0]));
        expect(ledgerId.isMainnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);

        ledgerId = LedgerId.fromString("1");
        expect(ledgerId.isTestnet()).to.eql(true);
        expect(ledgerId.isMainnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);
        ledgerId = LedgerId.fromString(TESTNET);
        expect(ledgerId.isTestnet()).to.eql(true);
        expect(ledgerId.isMainnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);
        ledgerId = LedgerId.fromBytes(new Uint8Array([1]));
        expect(ledgerId.isTestnet()).to.eql(true);
        expect(ledgerId.isMainnet()).to.eql(false);
        expect(ledgerId.isPreviewnet()).to.eql(false);

        ledgerId = LedgerId.fromString("2");
        expect(ledgerId.isPreviewnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isMainnet()).to.eql(false);
        ledgerId = LedgerId.fromString(PREVIEWNET);
        expect(ledgerId.isPreviewnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isMainnet()).to.eql(false);
        ledgerId = LedgerId.fromBytes(new Uint8Array([2]));
        expect(ledgerId.isPreviewnet()).to.eql(true);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isMainnet()).to.eql(false);

        ledgerId = LedgerId.fromBytes(new Uint8Array([3]));
        expect(ledgerId.isPreviewnet()).to.eql(false);
        expect(ledgerId.isTestnet()).to.eql(false);
        expect(ledgerId.isMainnet()).to.eql(false);
    });
});
