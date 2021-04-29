/*
This is a smart contract to implement the functionality of Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

import "./Constants.sol";
import "./CheckInterface.sol" as Check;
import "./DRPReactionInterface.sol" as Reaction;

contract DDA {
    // Client Check Policy definition
    struct CCP {
        string clientName;
        address clientAddress;
        uint256 validFrom;
        uint256 validTo;
        uint16 version;
        address checkContract;
    }
    
    // Domain Reaction Policy definition
    struct DRP {
        string domainName;
        string issuerName;
        address domainAddress;
        uint256 validFrom;
        uint256 validTo;
        uint16 version;
        address reactContract;
    }
    
    struct Client {
        CCP ccp;
        DRP[] drpList;
    }
    
    struct Domain {
        DRP drp;
        bytes32 domainSign;
        uint16 numRevoked;
    }
    
    // an associative array of clients registered in the system
    mapping(address => Client) clients;
    
    // an associative array of domains registered in the system
    mapping(string => Domain) domains;
    
    event DRPpurchased(address indexed _from, address indexed _to, uint _amount);
    
    function registerClient(
        string _name,
        uint256 _validFrom,
        uint256 _validTo,
        uint16 _version,
        address _checkContract
    ) public returns (bool){
        if (clients[msg.sender].ccp.clientName != ""){
             Client newClient;
            newClient.ccp = CCP(_name, msg.sender, _validFrom, _validTo, _version, _checkContract);
            clients[msg.sender] = newClient;
            return true; 
        }
        return false;
    }
    
    function registerDomain(
        string _domainName,
        string _issuerName,
        uint256 _validFrom,
        uint256 _validTo,
        uint16 _version,
        address _reactContract,
        bytes32 _domainSign
    ) public returns (bool){
        if (domains[_domainName].drp.domainName != ""){
            Domain newDomain;
            newDomain.drp = Domain(_domainName, _issuerName, msg.sender, _validFrom, _validTo, _version, _reactContract);
            newDomain.domainSign = _domainSign;
            newDomain.numRevoked = 0;
            domains[_domainName] = newDomain; 
            return true;
        }
        return false;
    }
    
    function purchaseDRP(string _domainName) public {
        /* Parameters : Client address and domain name
        *  TODO : Purchase DRP of domain; emit event DRPpurchased
        */
        
    }
    
    function checkCertificate() public {
        /* Parameters : Client address, domain name, CT log of the domain certificate, Revocation list of the domain certificate, 
        *               signature verification of the certificate
        *  TODO : Call Check contract from Client CCP, check validity of certificate using CT log
        *  Returns : boolean value true or false
        */
    }
}
