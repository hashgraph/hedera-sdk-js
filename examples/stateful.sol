pragma solidity >=0.4.22 <0.7.0;

contract StatefulContract {
    // the contract's owner, set in the constructor
    address owner;

    // the message we're storing
    string message;

    constructor(string memory message_) public {
        // set the owner of the contract for `kill()`
        owner = msg.sender;
        message = message_;
    }

    function setMessage(string memory message_) public {
        // only allow the owner to update the message
        if (msg.sender != owner) return;
        message = message_;
    }

    // return a string
    function getMessage() public view returns (string memory) {
        return message;
    }

    // recover the funds of the contract
    function kill() public { if (msg.sender == owner) selfdestruct(msg.sender); }
}
