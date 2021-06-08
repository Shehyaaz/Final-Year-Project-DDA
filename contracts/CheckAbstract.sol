// SPDX-License-Identifier: MIT
/*
This is an abstract smart contract that provides an interface to the Check contract in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.6.0;

abstract contract CheckAbstract {
    enum OCSPResponse {unknown, good, revoked}
    
    uint8 constant public minSCT = 2;
    
    mapping(bytes32 => uint8) public ocspResType;
    mapping(bytes32 => bool) public ctLogIDs;
    uint24 public maximum_merge_delay;
    address payable owner;
    
    constructor() public {
        owner = msg.sender;
        ocspResType[bytes32("unknown")] = 0;
        ocspResType[bytes32("good")] = 1;
        ocspResType[bytes32("revoked")] = 2;
    }
    
    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }
    
    /* this function receives the CT Log IDS and maximum merge delay from DDA contract  */
    function setCTLogs(
        bytes32[] calldata _ctLogIDs,
        uint24 _maximum_merge_delay
    ) external {
        maximum_merge_delay = _maximum_merge_delay;
        
        for(uint256 i = 0; i < _ctLogIDs.length; i++){
            ctLogIDs[_ctLogIDs[i]] = true;
        }
    }
    
    /* 
    * This function must be implemented by a child contract.
    * Return value indicates if the CCP address is valid.
    */
    function verifyCCP(
        address _clientAddr,
        address _ccpAddr
    ) external view virtual returns (bool);
    
    /* 
    * This function must be implemented by a child contract.
    * Return value indicates if the certificate is valid.
    */
    function check(
        bytes32[] calldata _sctLogID,
        uint256[] calldata _sctTimestamp,
        uint256 _certValidFrom,
        uint256 _certValidTo,
        bytes32 _ocspRes
    ) external view virtual returns(bool);
}
