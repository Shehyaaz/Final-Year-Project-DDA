// SPDX-License-Identifier: MIT
/*
This is an abstract smart contract that provides an interface to the Trigger contract in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.6.0;

abstract contract DRPAbstract {
    address payable owner;
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier notOwner() {
        require(owner != msg.sender);
        _;
    }
    
    // this fallback function allows the contract to receive ether
    receive() external payable{
        
    }
    
    /* this function transfers the ether to the contract that called this method, i.e., to DDA contract */
    function trigger(
        uint256 _drpPrice,
        uint8 internal_misbehaviour,
        uint8 contract_fund_payment
    ) external notOwner{
        uint256 amount = (_drpPrice / 10)*(internal_misbehaviour + contract_fund_payment);
        require(address(this).balance >= amount);
        msg.sender.transfer(amount);
    }
    
    /* 
    * This function must be implemented by a child contract.
    * Return value indicates if the DRP address is valid.
    */
    function verifyDRP(
        address _domainAddr,
        address _drpAddr
    ) external view virtual returns (bool);
}
