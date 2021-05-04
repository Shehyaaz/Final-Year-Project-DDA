/*
This is a smart contract that implements the CheckInterface in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

import "./CheckInterface.sol";

contract Check is CheckInterface {
    function check(
        string memory cert, 
        string memory ctLog, 
        string memory revLog, 
        string memory signature
    ) public onlyOwner returns(bool){
        // TODO: to be implemented
    } 
}
