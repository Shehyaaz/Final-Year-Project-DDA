// SPDX-License-Identifier: MIT
/*
This is a smart contract that implements the CheckInterface in Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.6.0;

<<<<<<< HEAD
import "./CheckInterface.sol";

contract Check is CheckInterface {
    /* Overrides function of CheckInterface */
    function check(
        bytes32[] calldata _ctLogIDs, 
        bytes32[] calldata _sctLogID,
        uint256[] calldata _sctTimestamp,
        uint256 _maximum_merge_delay,
        uint256 _certValidFrom,
        uint256 _certValidTo
    ) external view onlyOwner returns(bool){
        /* checks the sct log id against the ct log ids, also checks certificate validity */
        uint8 minSCT = 2;
        bool status = true; // assume certificate is valid
        if(_sctLogID.length < minSCT || now > _certValidTo) // certificate must have at least 2 SCTs and must not be expired
            status = false;
        for(uint8 i=0; i < minSCT; i++){
            if(_sctTimestamp[i] + _maximum_merge_delay > now){
                status = false;
                break;   
            }
            for(uint8 j = 0; j < _ctLogIDs.length; j++){
                if(_sctLogID[i] == _ctLogIDs[j]){
                    status = true;
                    break;
                }
            }
        }
        return status;
=======
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
        string calldata _ocspRes
    ) external view override returns(bool){
        /* checks the sct log id against the ct log ids, also checks certificate validity */
        uint8 minSCT = 2;
        bool certStatus = true; // assume certificate is valid
        uint8 found = 0;
         // certificate must have at least 2 SCTs and must not be expired
        if(_sctLogID.length >= minSCT && 
            _certValidFrom <= now && _certValidTo >= now && 
            ocspResType[_ocspRes] != uint8(OCSPResponse.revoked)){
                
            for(uint8 i=0; i < _sctLogID.length; i++){
                if(_sctTimestamp[i] + maximum_merge_delay > now){
                    found = found == 0 ? 0 : found - 1;   
                }
                if(ctLogIDs[_sctLogID[i]]){
                    found++;
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
>>>>>>> origin/test
    } 
}
