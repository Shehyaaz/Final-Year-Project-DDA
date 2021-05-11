/*
This is an abstract smart contract that provides an interface to the Check contract in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

contract CheckInterface {
    address payable owner;
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender, "Only contract owner can access this function");
        _;
    }
    
    function verifyAddress(address _addr) public view returns(bool){
        return _addr == address(this);
    }
    
    /* this function destroys the contract */
    function terminateCCP() public {
        selfdestruct(owner);
    }
    
    /* 
    * This function must be implemented by a child contract.
    *  First return value indicates if the certificate is valid, second value indicates if the signature is valid
    */
    function check(
        bytes32[] calldata _ctLogIDs, 
        bytes32[] calldata _sctLogID,
        uint256[] calldata _sctTimestamp,
        uint256 _maximum_merge_delay,
        uint256 _certValidFrom,
        uint256 _certValidTo
    ) external returns(bool);
}
