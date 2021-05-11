/*
This is an abstract smart contract that provides an interface to the Trigger contract in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

contract DRPReactionInterface {
    address payable owner;
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier notOwner() {
        require(owner != msg.sender, "Contract owner cannot call this function");
        _;
    }
    
    function verifyAddress(address _addr) public view returns(bool){
        return _addr == address(this);
    }
    
    /* this function destroys the contract */
    function terminate() external {
        selfdestruct(owner);
    }
    
    /* This function must be implemented by a child contract.
    *  This function is called when the domain's certificate is found to be invalid
    */
    function trigger(
        uint256 _drpPrice,
        uint8 internal_misbehaviour,
        uint8 contract_fund_payment,
        uint8 den
    ) external;
}
