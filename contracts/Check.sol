// SPDX-License-Identifier: MIT
/*
This is a smart contract that implements the CheckInterface in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.6.0;

import "./CheckAbstract.sol";

contract Check is CheckAbstract {
     /* Overrides function of CheckAbstract */
     function verifyCCP(
        address _clientAddr,
        address _ccpAddr
     ) external view override returns(bool){
         return (_ccpAddr == address(this) && _clientAddr != address(0));
     }
    
    /* Overrides function of CheckAbstract */
    function check(
        bytes32[] calldata _sctLogID,
        uint256[] calldata _sctTimestamp,
        uint256 _certValidFrom,
        uint256 _certValidTo,
        bytes32 _ocspRes
    ) external view override returns(bool){
        /* checks the sct log id against the ct log ids, also checks certificate validity */
        bool certStatus = true; // assume certificate is valid
        uint8 found = 0;
         // certificate must have at least 2 SCTs and must not be expired
        if(_sctLogID.length >= minSCT && 
            _certValidFrom <= now && _certValidTo >= now && 
            ocspResType[_ocspRes] != uint8(OCSPResponse.revoked)){
                
            for(uint8 i=0; i < _sctLogID.length; i++){
                if(_sctTimestamp[i] + maximum_merge_delay <= now && ctLogIDs[_sctLogID[i]]){
                    found++;  
                }
                else{
                    found = found == 0 ? 0 : found - 1; 
                }
            }
            if(found < minSCT){
                certStatus = false;
            }  
        }
        else{
            certStatus = false;
        }
        return certStatus;
    } 
}
