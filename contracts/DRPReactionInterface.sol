/*
This is an abstract smart contract that provides an interface to the Trigger contract in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

contract DRPReactionInterface {
    address owner;
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier notOwner() {
        require(owner != msg.sender, "Contract owner cannot call this function");
        _;
    }
    
    function trigger() public;
    /* This function must be implemented by a child contract.
    *  This function is called when the domain's certificate is found to be invalid
    */
}
