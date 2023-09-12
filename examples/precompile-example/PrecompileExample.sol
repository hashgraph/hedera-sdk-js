// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./ExpiryHelper.sol";
import "./PrngSystemContract.sol";
import "./KeyHelper.sol";
import "./HederaTokenService.sol";
import "./FeeHelper.sol";

// To alter the behavior of the SolidityPrecompileExample, re-compile this solidity file
// (you will also need the other files in this directory)
// and copy the outputted json file to ./PrecompileExample.json

contract PrecompileExample is
    PrngSystemContract,
    HederaTokenService,
    ExpiryHelper,
    KeyHelper,
    FeeHelper
{
    address payable owner;
    address payable aliceAccount;
    address fungibleToken;
    address nftToken;

    constructor(address payable _owner, address payable _aliceAccount) {
        owner = _owner;
        aliceAccount = _aliceAccount;
    }

    function step0() external returns (bytes32 result) {
        require(msg.sender == owner);

        result = this.getPseudorandomSeed();
    }

    // In order for some functions (such as createFungibleToken) to work, the contract must possess the funds for
    // the function call.  We are using ContractExecuteTransaction.setPayableAmount() to transfer some Hbar
    // to the contract's account at each step (which means this function must be payable), and then transferring
    // the excess Hbar back to the owner at the end of each step.
    function step1() external payable returns (int responseCode) {
        require(msg.sender == owner);

        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](4);
        keys[0] = getSingleKey(
            KeyType.ADMIN,
            KeyType.PAUSE,
            KeyValueType.INHERIT_ACCOUNT_KEY,
            bytes("")
        );

        keys[1] = getSingleKey(
            KeyType.FREEZE,
            KeyValueType.INHERIT_ACCOUNT_KEY,
            bytes("")
        );
        keys[2] = getSingleKey(
            KeyType.WIPE,
            KeyValueType.INHERIT_ACCOUNT_KEY,
            bytes("")
        );
        keys[3] = getSingleKey(
            KeyType.SUPPLY,
            KeyValueType.INHERIT_ACCOUNT_KEY,
            bytes("")
        );

        //KeyType.SUPPLY KeyType.FREEZE,
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
                createAutoRenewExpiry(address(this), 7000000)
            ),
            100, // initial supply
            0 // decimals
        );

        // send any excess Hbar back to the owner
        owner.transfer(address(this).balance);
    }

    function step2() external returns (int responseCode) {
        require(msg.sender == owner);

        int64 newTotalSupply;
        int64[] memory mintedSerials; // applicable to NFT tokens only
        (responseCode, newTotalSupply, mintedSerials) = mintToken(
            fungibleToken,
            100, // amount (applicable to fungible tokens only)
            new bytes[](0) // metadatas (applicable to NFT tokens only)
        );

        require(newTotalSupply == 100 + 100);
    }

    function step3() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = associateToken(aliceAccount, fungibleToken);
    }

    function step4() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = transferToken(
            fungibleToken,
            address(this), // sender
            aliceAccount, // receiver
            100 // amount to transfer
        );
    }

    function step5() external returns (int responseCode) {
        require(msg.sender == owner);

        // this contract will be the allowance owner
        responseCode = approve(
            fungibleToken,
            aliceAccount, // spender
            100 // amount
        );
    }

    function step6() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = HederaTokenService.pauseToken(fungibleToken);
    }

    function step7() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = HederaTokenService.unpauseToken(fungibleToken);
    }

    function step8() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = freezeToken(fungibleToken, aliceAccount);
    }

    function step9() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = unfreezeToken(fungibleToken, aliceAccount);
    }

    function step10() external returns (int responseCode) {
        require(msg.sender == owner);

        int64 totalSupplyLeftAfterBurn;
        (responseCode, totalSupplyLeftAfterBurn) = burnToken(
            fungibleToken,
            50, // amount to burn (applicable to fungible tokens only)
            new int64[](0) // serial numbers to burn (applicable to NFT tokens only)
        );

        require(totalSupplyLeftAfterBurn == 100 + 100 - 50);
    }

    function step11(
        bytes memory keyBytes
    ) external payable returns (int responseCode, address) {
        require(msg.sender == owner);

        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](1);
        // Set the admin key and the supply key to given ED25519 public key bytes.
        // These must be the key's raw bytes acquired via key.toBytesRaw()

        keys[0] = getSingleKey(
            KeyType.ADMIN,
            KeyType.SUPPLY,
            KeyValueType.ED25519,
            keyBytes
        );

        IHederaTokenService.FixedFee[]
            memory fixedFees = new IHederaTokenService.FixedFee[](1);
        // Create a fixed fee of 1 Hbar (100,000,000 tinybar) that is collected by owner
        fixedFees[0] = createFixedFeeForHbars(100000000, owner);

        (responseCode, nftToken) = createNonFungibleTokenWithCustomFees(
            IHederaTokenService.HederaToken(
                "Example NFT token", // name
                "ENFT", // symbol
                address(this), // treasury
                "memo",
                true, // supply type, false -> INFINITE, true -> FINITE
                1000, // max supply
                false, // freeze default (setting to false means that this token will not be initially frozen on creation)
                keys, // the keys for the new token
                // auto-renew fee paid by aliceAccount every 7,000,000 seconds (approx. 81 days).
                // This is the minimum auto renew period.
                createAutoRenewExpiry(address(this), 7000000)
            ),
            fixedFees,
            new IHederaTokenService.RoyaltyFee[](0)
        );

        // send any excess Hbar back to the owner
        owner.transfer(address(this).balance);
        return (responseCode, nftToken);
    }

    function step12(
        bytes[] memory metadatas
    ) external returns (int responseCode) {
        require(msg.sender == owner);
        require(metadatas.length == 3);

        int64 mintedCount;
        int64[] memory mintedSerials; // applicable to NFT tokens only
        (responseCode, mintedCount, mintedSerials) = mintToken(
            nftToken,
            0, // amount (applicable to fungible tokens only)
            metadatas // (applicable to NFT tokens only)
        );

        require(mintedCount == 3);
        require(mintedSerials.length == 3);
        require(mintedSerials[0] == 1);
        require(mintedSerials[1] == 2);
        require(mintedSerials[2] == 3);
    }

    function step13() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = associateToken(aliceAccount, nftToken);
    }

    function step14() external returns (int responseCode) {
        require(msg.sender == owner);

        // You may also use transferNFTs to transfer more than one serial number at a time

        responseCode = transferNFT(
            nftToken,
            address(this), // sender
            aliceAccount, // receiver
            1 // serial number
        );
    }

    function step15() external returns (int responseCode) {
        require(msg.sender == owner);

        responseCode = approveNFT(nftToken, aliceAccount, 2);
    }

    function step16() external returns (int responseCode) {
        require(msg.sender == owner);

        int64[] memory serialsToBurn = new int64[](1);
        serialsToBurn[0] = 3;

        int64 totalSupplyLeftAfterBurn;
        (responseCode, totalSupplyLeftAfterBurn) = burnToken(
            nftToken,
            0, // amount to burn (applicable to fungible tokens only)
            serialsToBurn
        );

        require(totalSupplyLeftAfterBurn == 2);
    }
}
