/*
This is an abstract smart contract that provides an interface to the Check contract in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

contract CheckInterface {
    address owner;
    
    function constructor() public {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender, "Only contract owner can access this function");
        _;
    }
    
    function check(
        string memory cert, 
        string memory ctLog, 
        string memory revLog, 
        string memory signature
    ) public onlyOwner returns(bool, bool);
    /* This function must be implemented by a child contract.
    *  First return value indicates if the certificate is valid, second value indicates if the signature is valid
    */
}
