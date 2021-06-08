// SPDX-License-Identifier: MIT
/*
This is a smart contract to implement the functionality of Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.6.0;

import "./CheckAbstract.sol";
import "./DRPAbstract.sol";

contract DDA {
    
    /* the log ID of the CT logs trusted by DDA are stored in ctLogsID array */
    bytes32[] public ctLogIDs;
    uint24 public constant maximum_merge_delay = 86400;
    /* contract owner address */
    address payable public contractOwner;
    
    /* Parameters used to determine various payments in this contract.
       The common denominator for all parameters is 10
    */
    uint8 constant private escrow = 3; // escrow parameter(alpha) = 30% (NOTE: escrow parameter > 25 % given the below set of parameters)
    uint8 constant private termination_parameter = 3; // termination parameter(delta) = 30% 
    uint8 constant private internal_misbehaviour = 9; // internal misbehaviour payment(mi) = 90%
    uint8 constant private contract_fund_payment = 3; // contract fund payment(f) = 30%
    uint8 constant private termination_payment = 4; // termination payment(t) = 40%
    uint8 constant private total_funds = internal_misbehaviour + termination_payment + contract_fund_payment;
    uint256 constant public client_registration_fee = 0.001 ether;
    uint256 constant public domain_registration_fee = 0.01 ether;
    uint256 constant public update_fee = 0.001 ether;

    /* Client Check Policy definition */
    struct CCP {
        bytes32 clientName;
        uint256 validFrom;
        uint256 validTo;
        address payable clientAddress;
        address checkContract;
        uint8 version;
    }
    
    /* Domain Reaction Policy definition */
    struct DRP {
        bytes32 domainName;
        bytes32 issuerName;
        uint256 validFrom;
        uint256 validTo;
        address payable domainAddress;
        address payable reactContract;
        uint8 version;
    }
    
    struct Client {
        CCP ccp;
        address[] purchasedDRP; // list of domain addresses whose DRP has been purchased
        mapping(address => uint256) lastChecked;
    }
    
    struct Domain {
        DRP drp;
        uint256 drpPrice;
        uint256 escrowedAmount;
    }
    
    /* an associative array of clients registered in the system */
    mapping(address => Client) clients;
    
    /* an array of domains registered in the system */
    address[] public registeredDomains;
    mapping(bytes32 => uint256) public registeredDomainNames;
    mapping(address => Domain) domains;
    
    
    /* events for various operations */
    event Registered(address _addr);
    event Updated(address _addr);
    event DRPpurchased(address _clientAddr, bytes32 _domainName);
    event CertChecked(address _clientAddr, bytes32 _domainName, bool _certValid);
    event DRPExpired(bytes32 _domainName);
    event DRPDeleted(address _domainAddr);
    
    constructor(bytes32[] memory _ctLogIDs) public {
        contractOwner = msg.sender;
        for(uint16 i = 0; i < _ctLogIDs.length; i++){
            ctLogIDs.push(_ctLogIDs[i]);
        }
    }
    
    // this fallback function allows the contract to receive ether
    receive() external payable{
        
    }
    
    function registerClient(
        bytes32 _name,
        uint256 _validFrom,
        uint256 _validTo,
        address _checkContract,
        uint8 _version
    ) external payable{
        require(clients[msg.sender].ccp.clientName == "" &&
            _name != "" && 
            _validTo > _validFrom && 
            CheckAbstract(_checkContract).verifyCCP(msg.sender, _checkContract) &&
            msg.value == client_registration_fee
        );
        
        clients[msg.sender].ccp = CCP(_name, _validFrom, _validTo, msg.sender, _checkContract, _version);
        // pass CT logs to Check Contract
        CheckAbstract(_checkContract).setCTLogs(ctLogIDs, maximum_merge_delay);
        
        emit Registered(msg.sender);
    }
    
    function updateClient(
        uint256 _validTo
    ) external payable{
        require(clients[msg.sender].ccp.clientName != "" &&
            _validTo > clients[msg.sender].ccp.validFrom &&
            msg.value == update_fee
        );
        
        clients[msg.sender].ccp.validTo = _validTo;
        
        emit Updated(msg.sender);
    }
    
    function registerDomain(
        bytes32 _domainName,
        bytes32 _issuerName,
        uint256 _validFrom,
        uint256 _validTo,
        uint256 _drpPrice,
        address payable _reactContract,
        uint8 _version
    ) external payable{
        require(registeredDomainNames[_domainName] == 0 &&
            _domainName != "" &&
            _issuerName != "" &&
            _validTo > _validFrom &&
            DRPAbstract(_reactContract).verifyDRP(msg.sender, _reactContract) &&
            msg.value == (domain_registration_fee + (_drpPrice/10)*(internal_misbehaviour + contract_fund_payment))
        );
        
        domains[msg.sender].drp = DRP(_domainName, _issuerName, _validFrom, _validTo, msg.sender, _reactContract, _version);
        domains[msg.sender].drpPrice = _drpPrice;
        registeredDomains.push(msg.sender);
        registeredDomainNames[_domainName] = registeredDomains.length; // add domain name to list of registered addresses

        // tranfer (_drpPrice/10)*(internal_misbehaviour + contract_fund_payment ether to _reactContract, this is to ensure the _reactContract has sufficient balance
        _reactContract.transfer((_drpPrice/10)*(internal_misbehaviour + contract_fund_payment));
        
        emit Registered(msg.sender);
    }
    
    function updateDomain(
        bytes32 _issuerName,
        uint256 _validTo
    ) external payable{
        require(domains[msg.sender].drp.domainName != "" &&
            _issuerName != "" &&
            _validTo > domains[msg.sender].drp.validFrom &&
            msg.value == update_fee
        );
        
        domains[msg.sender].drp.issuerName = _issuerName;
        domains[msg.sender].drp.validTo = _validTo;
        
        emit Updated(msg.sender);
    }
    
    function purchaseDRP(address payable _domainAddr) external payable {
        Domain memory domain = domains[_domainAddr];
        require(clients[msg.sender].ccp.clientName != "" &&
            domain.drp.reactContract != address(0) &&
            msg.value == domain.drpPrice
        );
        
        // add DRP to client drp list
        clients[msg.sender].purchasedDRP.push(_domainAddr);
        clients[msg.sender].lastChecked[_domainAddr] = 1; // this indicates that the DRP was purchased, but is not checked
        
        // transfer amount to domain address in DRP
        uint256 escrowAmount = (domain.drpPrice/100) * escrow * total_funds;
        domains[_domainAddr].escrowedAmount += escrowAmount;
        _domainAddr.transfer(domain.drpPrice - escrowAmount);
        
        emit DRPpurchased(msg.sender, domain.drp.domainName);
    }
    
    function checkCertificate(
        uint256 _drpIndex,
        bytes32[] calldata _sctLogID,
        uint256[] calldata _sctTimestamp,
        uint256 _certValidFrom,
        uint256 _certValidTo,
        bytes32 _ocspRes
    ) external {
        CCP memory ccp = clients[msg.sender].ccp;
        Domain memory domain = domains[clients[msg.sender].purchasedDRP[_drpIndex]];
        DRPAbstract reactContract = DRPAbstract(domain.drp.reactContract);
        require(ccp.validTo >= now &&
            domain.drp.validTo >= now &&
            domain.drp.reactContract != address(0)
        );
        
        bool status = CheckAbstract(ccp.checkContract).check(_sctLogID, _sctTimestamp, _certValidFrom, _certValidTo, _ocspRes);
        if(!status){ // invalid certificate detected
            reactContract.trigger(
                domain.drpPrice,
                internal_misbehaviour,
                contract_fund_payment
            );
            uint256 misbehaviour_payment = (domain.drpPrice / 10)*internal_misbehaviour;
            
            // delete drp from drpList
            deleteDRPFromClientList(ccp.clientAddress, _drpIndex);

            // terminate DRP
            uint256 termination_payment_client = (domain.drpPrice/10)*(termination_parameter) +
                    ((domain.drpPrice/10)*(domain.drp.validTo - now)/(domain.drp.validTo - domain.drp.validFrom))*(termination_payment - termination_parameter);
            
            // set reaction contract to empty address
            domains[domain.drp.domainAddress].drp.reactContract = address(0);
            
            // reduce domain's escrowed amount
            domains[domain.drp.domainAddress].escrowedAmount -= termination_payment_client;
            // transfer ether to client
            msg.sender.transfer(misbehaviour_payment + termination_payment_client);
            
            emit CertChecked(msg.sender, domain.drp.domainName, status);
        }
        else{
            clients[ccp.clientAddress].lastChecked[domain.drp.domainAddress] = now;
            emit CertChecked(msg.sender, domain.drp.domainName, status);
        }
    }
    
    /* delete DRP from client DRP list */
    function deleteDRPFromClientList(address _clientAddr, uint256 _drpIndex) public{
        require(clients[_clientAddr].ccp.clientName != "");
        
        uint256 drpListLength = clients[_clientAddr].purchasedDRP.length;
        address domainAddr = clients[_clientAddr].purchasedDRP[_drpIndex];
        clients[_clientAddr].purchasedDRP[_drpIndex] = clients[_clientAddr].purchasedDRP[drpListLength - 1];
        clients[_clientAddr].purchasedDRP.pop(); // pop last element of array
        delete clients[_clientAddr].lastChecked[domainAddr];

        emit DRPDeleted(domainAddr);
    }
    
    /* function to expire DRP and delete it */
    function expireDRP() external{
        require(now > domains[msg.sender].drp.validTo); // Domain can expire DRP only after DRP validity has ended
        Domain memory domain = domains[msg.sender];
        // transfer escrowed amount to domain
        uint256 escrowAmount = domains[msg.sender].escrowedAmount;

        if(domain.drp.reactContract != address(0)){
            // domains DRP has not been triggered by client
            DRPAbstract(domain.drp.reactContract).trigger(
                domain.drpPrice,
                internal_misbehaviour,
                contract_fund_payment
            );
            escrowAmount = escrowAmount + (domain.drpPrice / 10)*(internal_misbehaviour + contract_fund_payment);
        }
        
        // delete DRP from domains
        registeredDomains[registeredDomainNames[domain.drp.domainName] - 1] = registeredDomains[registeredDomains.length - 1];
        delete domains[msg.sender];
        delete registeredDomainNames[domain.drp.domainName];
        registeredDomains.pop(); // pop last element of array 
        msg.sender.transfer(escrowAmount);
    
        emit DRPExpired(domain.drp.domainName);
    }
    
    /* Getter functions */
    
    function isClientRegistered() external view returns(bool){
        return clients[msg.sender].ccp.clientName != "";
    }
    
    function isDomainRegistered() external view returns(bool){
        return domains[msg.sender].drp.domainName != "";
    }
    
    /* get client details */
    function getClientDetails() external view returns(bytes32, uint256, uint256, address, address){
        CCP memory ccp = clients[msg.sender].ccp;
        return (
            ccp.clientName,
            ccp.validFrom,
            ccp.validTo,
            ccp.clientAddress,
            ccp.checkContract
        );
    }
    
    /* get domain details */
    function getDomainDetails() external view returns(bytes32, bytes32, uint256, uint256, uint256, address, address, uint256){
        Domain memory domain = domains[msg.sender];
        return (
            domain.drp.domainName,
            domain.drp.issuerName,
            domain.drp.validFrom,
            domain.drp.validTo,
            domain.drpPrice,
            domain.drp.domainAddress,
            domain.drp.reactContract,
            domain.escrowedAmount
        );
    }
    
    /* get details needed to purchase a DRP */
    function getDRPDetails(uint256 _drpIndex) external view returns(bytes32, uint256, address){
        Domain memory domain = domains[registeredDomains[_drpIndex]];
        if(domain.drp.validTo >= now && domain.drp.reactContract != address(0) && clients[msg.sender].lastChecked[domain.drp.domainAddress] == 0)
            return (
              domain.drp.domainName,
              domain.drpPrice,
              domain.drp.domainAddress
            );
    }
    
    /* get client drp list length */
    function getClientDRPListLength() external view returns(uint256){
        return clients[msg.sender].purchasedDRP.length;
    }

    /* get number of registered domains */
    function getNumDRP() external view returns(uint256){
        return registeredDomains.length;
    }
    
    /* get client DRP list details */
    function getClientDRPList(uint256 _drpIndex) external view returns(bytes32, uint256, uint256, uint256, uint256){
        Domain memory domain = domains[clients[msg.sender].purchasedDRP[_drpIndex]];
        if(domain.drp.validTo >= now) // return those DRPs that are still valid
            return (
                domain.drp.domainName,
                domain.drp.validFrom,
                domain.drp.validTo,
                domain.drpPrice,
                clients[msg.sender].lastChecked[domain.drp.domainAddress]
            );
    }
    
    /* get CCP status */
    function getCCPStatus() external view returns(bool, bool){
        CCP memory ccp = clients[msg.sender].ccp;
        return (ccp.validTo >= now, ccp.checkContract != address(0)) ;
    }
    
    /* get DRP status */
    function getDRPStatus() external view returns(bool, bool){
        DRP memory drp = domains[msg.sender].drp;
        return (drp.validTo >= now, drp.reactContract != address(0));
    }
}