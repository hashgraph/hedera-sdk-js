// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./ExpiryHelper.sol";

// To alter the behavior of the SolidityPrecompileExample, re-compile this solidity file
// (you will also need the other files in this directory)
// and copy the outputted json file to ./PrecompileExample.json

contract ZeroTokenOperations is ExpiryHelper {
    address payable owner;
    address payable aliceAccount;
    address fungibleToken;
    address nftToken;

    constructor(address payable _owner, address payable _aliceAccount) {
        owner = _owner;
        aliceAccount = _aliceAccount;
    }

    // In order for some functions (such as createFungibleToken) to work, the contract must possess the funds for
    // the function call.  We are using ContractExecuteTransaction.setPayableAmount() to transfer some Hbar
    // to the contract's account at each step (which means this function must be payable), and then transferring
    // the excess Hbar back to the owner at the end of each step.
    function step0() external payable returns (int responseCode) {
        require(msg.sender == owner);

        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](1);
        // Set the admin key, supply key, pause key, and freeze key to the key of the account that executed function (INHERIT_ACCOUNT_KEY).
        keys[0] = createSingleKey(
            ADMIN_KEY_TYPE |
                SUPPLY_KEY_TYPE |
                PAUSE_KEY_TYPE |
                FREEZE_KEY_TYPE |
                WIPE_KEY_TYPE,
            INHERIT_ACCOUNT_KEY,
            bytes("")
        );

        (responseCode, fungibleToken) = createFungibleToken(
            IHederaTokenService.HederaToken(
                "Example Fungible token", // name
                "E", // symbol
                address(this), // treasury
                "memo",
                true, // supply type, false -> INFINITE, true -> FINITE
                1000, // max supply
                false, // freeze default (setting to false means that this token will not be initially frozen on creation)
                keys, // the keys for the new token
                // auto-renew fee paid by aliceAccount every 7,000,000 seconds (approx. 81 days).
                // This is the minimum auto renew period.
                createAutoRenewExpiry(aliceAccount, 7000000)
            ),
            100, // initial supply
            0 // decimals
        );

        // send any excess Hbar back to the owner
        owner.transfer(address(this).balance);
    }

    function step1() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = associateToken(aliceAccount, fungibleToken);
    }

    function step2() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = transferToken(
            fungibleToken,
            address(this), // sender
            aliceAccount, // receiver
            0 // amount to transfer
        );
    }

    function step3() external returns (int responseCode) {
        require(msg.sender == owner);

        uint64 newTotalSupply;
        int64[] memory mintedSerials; // applicable to NFT tokens only
        (responseCode, newTotalSupply, mintedSerials) = mintToken(
            fungibleToken,
            0, // amount (applicable to fungible tokens only)
            new bytes[](0) // metadatas (applicable to NFT tokens only)
        );

        require(newTotalSupply == 100 + 0);
    }

    function step4() external returns (int responseCode) {
        require(msg.sender == owner);

        uint64 newTotalSupply;
        int64[] memory mintedSerials; // applicable to NFT tokens only
        (responseCode, newTotalSupply) = burnToken(
            fungibleToken,
            0, // amount (applicable to fungible tokens only)
            mintedSerials // metadatas (applicable to NFT tokens only)
        );

        require(newTotalSupply == 100 + 0);
    }

    function step5() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = wipeTokenAccount(
            fungibleToken,
            aliceAccount, // owner of tokens to wipe from
            0 // amount to transfer
        );
    }
}
