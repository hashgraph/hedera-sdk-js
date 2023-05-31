// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.0;

contract SetData {
    string public message;
    string public second_message;

    function setMessage(string memory _message) public returns (string memory) {
        message = _message;
        return "OK";
    }

    function getMessage() public view returns (string memory) {
        return message;
    }

    function setMultipleMessages(
        string memory _message,
        string memory _second_message
    ) public returns (string memory) {
        message = _message;
        second_message = _second_message;
        return "OK";
    }
}
