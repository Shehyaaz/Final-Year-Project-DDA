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
        // TODO : add members based on high level design
    }
    
    // Domain Reaction Policy definition
    struct DRP {
        // TODO : add members based on high level design
    }
    
    struct Client {
        // TODO: this struct has a CCP member and a list of DRPs issued
    }
    
    struct Domain {
        // TODO: this struct has a DRP member and the number of revoked certificates
    }
    
    // an associative array of clients registered in the system
    mapping(address => Client) clients; // key : client address; value: Client object
    uint numClients public; // stores the count of the clients registered in the contract
    
    // an associative array of domains registered in the system
    mapping(string => Domain) domains; // key : domain name ; value : Domain object
    uint numDomains public; // stores the count of the domains registered in the contract
    
    function constructor() public {
        numClients = 0;
        numDomains = 0;
    }
    
    event ClientRegistered(address indexed _clientAddress, uint indexed _numClient);
    event DomainRegistered(address indexed _domainAddress, uint indexed _numDomain);
    event DRPpurchased(address indexed _from, address indexed _to, uint _amount);
    
    function registerClient() public {
        /* Parameters : fields in the CCP
        *  TODO : Create a Client object and add it to clients mapping, emit ClientRegistered event
        */
        
    }
    
    function registerDomain() public {
        /* Parameters : fields in the DRP
        *  TODO : Create a Domain object and add it to domians mapping, emit DomainRegistered event
        */
        
    }
    
    function purchaseDRP() public {
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
