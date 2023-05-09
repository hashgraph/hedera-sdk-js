pragma solidity >=0.8.0;

contract Payable {
    // the contract's owner, set in the constructor
    address payable owner;

    constructor() payable {
        // set the owner of the contract for `kill()`
        owner = payable(msg.sender);
    }

    // return a string
    function greet() public pure returns (string memory) {
        return "Hello, world!";
    }

    // recover the funds of the contract
    function kill() public { if (msg.sender == owner) selfdestruct(payable(msg.sender)); }
}
