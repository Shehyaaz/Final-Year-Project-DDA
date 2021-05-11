/*
This is a smart contract that implements the CheckInterface in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

import "./CheckInterface.sol";

contract Check is CheckInterface {
    function check(
        bytes32[] calldata _ctLogIDs, 
        bytes32[] calldata _sctLogID,
        uint256[] calldata _sctTimestamp,
        uint256 _maximum_merge_delay,
        uint256 _certValidFrom,
        uint256 _certValidTo
    ) external onlyOwner returns(bool){
        // TODO: to be implemented
    } 
}
