/* eslint-disable mocha/no-setup-in-describe */
import {
    MAINNET,
    WEB_TESTNET,
    WEB_PREVIEWNET,
    NATIVE_PREVIEWNET,
    NATIVE_TESTNET,
} from "../../src/constants/ClientConstants.js";
import {
    AccountBalance,
    AccountBalanceQuery,
    Hbar,
} from "../../src/exports.js";
import IntegrationTestEnv from "./client/NodeIntegrationTestEnv.js";

describe("ClientConstantsIntegrationTest", function () {
    let env;

    before(async function () {
        env = await IntegrationTestEnv.new();
    });

    describe("MAINNET node proxies", function () {
        const proxies = Object.keys(MAINNET);
        proxies.forEach((proxy) => {
            it(`should fetch ${MAINNET[proxy]} account balnace`, async function () {
                const accountBalance = await new AccountBalanceQuery()
                    .setNodeAccountIds([MAINNET[proxy]])
                    .setAccountId(env.operatorId)
                    .execute(env.client);

                expect(accountBalance instanceof AccountBalance).to.be.true;
                expect(accountBalance.hbars instanceof Hbar).to.be.true;
            });
        });
    });

    describe("WEB TESTNET node proxies", function () {
        const proxies = Object.keys(WEB_TESTNET);
        proxies.forEach((proxy) => {
            it(`should fetch ${WEB_TESTNET[proxy]} account balnace`, async function () {
                const accountBalance = await new AccountBalanceQuery()
                    .setNodeAccountIds([WEB_TESTNET[proxy]])
                    .setAccountId(env.operatorId)
                    .execute(env.client);

                expect(accountBalance instanceof AccountBalance).to.be.true;
                expect(accountBalance.hbars instanceof Hbar).to.be.true;
            });
        });
    });

    describe("WEB PREVIEWNET node proxies", function () {
        const proxies = Object.keys(WEB_PREVIEWNET);
        proxies.forEach((proxy) => {
            it(`should fetch ${WEB_PREVIEWNET[proxy]} account balnace`, async function () {
                const accountBalance = await new AccountBalanceQuery()
                    .setNodeAccountIds([WEB_PREVIEWNET[proxy]])
                    .setAccountId(env.operatorId)
                    .execute(env.client);

                expect(accountBalance instanceof AccountBalance).to.be.true;
                expect(accountBalance.hbars instanceof Hbar).to.be.true;
            });
        });
    });

    describe("NATIVE PREVIEWNET node proxies", function () {
        const proxies = Object.keys(NATIVE_PREVIEWNET);
        proxies.forEach((proxy) => {
            it(`should fetch ${NATIVE_PREVIEWNET[proxy]} account balnace`, async function () {
                const accountBalance = await new AccountBalanceQuery()
                    .setNodeAccountIds([NATIVE_PREVIEWNET[proxy]])
                    .setAccountId(env.operatorId)
                    .execute(env.client);

                expect(accountBalance instanceof AccountBalance).to.be.true;
                expect(accountBalance.hbars instanceof Hbar).to.be.true;
            });
        });
    });

    describe("NATIVE TESTNET node proxies", function () {
        const proxies = Object.keys(NATIVE_TESTNET);
        proxies.forEach((proxy) => {
            it(`should fetch ${NATIVE_TESTNET[proxy]} account balnace`, async function () {
                const accountBalance = await new AccountBalanceQuery()
                    .setNodeAccountIds([NATIVE_TESTNET[proxy]])
                    .setAccountId(env.operatorId)
                    .execute(env.client);

                expect(accountBalance instanceof AccountBalance).to.be.true;
                expect(accountBalance.hbars instanceof Hbar).to.be.true;
            });
        });
    });
});
