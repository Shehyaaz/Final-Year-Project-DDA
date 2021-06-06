/*
This is a smart contract that implements the TriggerInterface in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.6.0;

import "./DRPAbstract.sol";

contract DRPReaction is DRPAbstract {
    /* Overrides function of DRPAbstract */
     function verifyDRP(
        address _domainAddr,
        address _drpAddr
     ) external view override returns(bool){
         return (_drpAddr == address(this) && _domainAddr != address(0));
     }
}
