/*
This is a library that defines the constants used  in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

library Constants {
	// constants
	uint constant drpAmount = 0; // amount to purchase DRP
	uint constant triggerAmount = 0; // amount paid as compensation if certificate is invalid
	
	// getter functions
	function getDRPAmount() public view returns(uint) {
	    return drpAmount; // returns DRP amount
	}
	
	function getTriggerAmount() public view returns(uint) {
	    return triggerAmount; // returns Trigger amount
	}
}
