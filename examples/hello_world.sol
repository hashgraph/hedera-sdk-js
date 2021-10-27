pragma solidity >=0.4.22 <0.6.0;

contract HelloWorld {
    // the contract's owner, set in the constructor
    address owner;

    constructor() public {
        // set the owner of the contract for `kill()`
        owner = msg.sender;
    }

    // return a string
    function greet() public pure returns (string memory) {
        return "Hello, world!";
    }

    // recover the funds of the contract
    function kill() public { if (msg.sender == owner) selfdestruct(msg.sender); }
}
