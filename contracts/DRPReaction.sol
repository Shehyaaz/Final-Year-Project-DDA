// SPDX-License-Identifier: MIT
/*
This is a smart contract that implements the TriggerInterface in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.6.0;

<<<<<<< HEAD
import "./DRPInterface.sol";

contract DRPReaction is DRPInterface {
    function trigger(
        uint256 _drpPrice,
        uint8 internal_misbehaviour,
        uint8 contract_fund_payment
    ) external notOwner{
        // transfer ethers to the contract that called this method
        uint256 amount = (_drpPrice / 10)*(internal_misbehaviour + contract_fund_payment);
        require(address(this).balance >= amount);
        msg.sender.transfer(amount);
    }
=======
import "./DRPAbstract.sol";

contract DRPReaction is DRPAbstract {
    /* Overrides function of DRPAbstract */
     function verifyDRP(
        address _domainAddr,
        address _drpAddr
     ) external view override returns(bool){
         return (_drpAddr == address(this) && _domainAddr != address(0));
     }
>>>>>>> origin/test
}
