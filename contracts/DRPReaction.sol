/*
This is a smart contract that implements the TriggerInterface in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

import "./DRPReactionInterface.sol";

contract DRPReaction is DRPReactionInterface {
    function trigger(
        uint256 _drpPrice,
        uint8 internal_misbehaviour,
        uint8 contract_fund_payment,
        uint8 den
    ) external notOwner{
        // TODO : to be implemented
    }
}
