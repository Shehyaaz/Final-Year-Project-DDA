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
    uint8 constant private escrow = 5; // escrow parameter(alpha) = 50% (NOTE: escrow parameter < 62.5 % given the below set of parameters)
    uint8 constant private termination_parameter = 2; // termination parameter(delta) = 20% 
    uint8 constant private internal_misbehaviour = 9; // internal misbehaviour payment(mi) = 90%
    uint8 constant private contract_fund_payment = 3; // contract fund payment(f) = 30%
    uint8 constant private termination_payment = 4; // termination payment(t) = 40%
    uint8 constant private total_funds = internal_misbehaviour + termination_payment + contract_fund_payment;
    uint256 constant public client_registration_fee = 0.01 ether;
    uint256 constant public domain_registration_fee = 0.05 ether;
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
        uint256 drpPrice;
        address payable domainAddress;
        address payable reactContract;
        uint8 version;
    }
    
    struct Client {
        CCP ccp;
        address[] purchasedDRP; // list of domain addresses whose DRP has been purchased
        mapping(address => uint256) lastChecked;
    }
    
    /* an associative array of clients registered in the system */
    mapping(address => Client) clients;
    
    /* an array of domains registered in the system */
    address[] public registeredDomains;
    mapping(address => DRP) domainDRPs;
    
    /* an associative array of amount escrowed from the domains */
    mapping(address => uint256) escrowedAmount;
    
    /* events for various operations */
    event Registered(address _addr);
    event Updated(address _addr);
    event DRPpurchased(address _clientAddr, address _domainAddr, uint256 _amount);
    event CertChecked(address _clientAddr, address _domainAddr, bool _certValid);
    event DRPExpired(address _domainAddr);
    event DRPDeleted(address _domainAddr);
    
    constructor(bytes32[] memory _ctLogIDs) public {
        contractOwner = msg.sender;
        for(uint256 i = 0; i < _ctLogIDs.length; i++){
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
        require(domainDRPs[msg.sender].domainName == "" &&
            _domainName != "" &&
            _issuerName != "" &&
            _validTo > _validFrom &&
            DRPAbstract(_reactContract).verifyDRP(msg.sender, _reactContract) &&
            msg.value == (domain_registration_fee + (_drpPrice/10)*(internal_misbehaviour + contract_fund_payment))
        );
        
        domainDRPs[msg.sender] = DRP(_domainName, _issuerName, _validFrom, _validTo, _drpPrice, msg.sender, _reactContract, _version);
        registeredDomains.push(msg.sender); // add domain address to list of registered addresses

        // tranfer (_drpPrice/10)*(internal_misbehaviour + contract_fund_payment ether to _reactContract, this is to ensure the _reactContract has sufficient balance
        _reactContract.transfer((_drpPrice/10)*(internal_misbehaviour + contract_fund_payment));
        
        emit Registered(msg.sender);
    }
    
    function updateDomain(
        bytes32 _issuerName,
        uint256 _validTo
    ) external payable{
        require(domainDRPs[msg.sender].domainName != "" &&
            _issuerName != "" &&
            _validTo > domainDRPs[msg.sender].validFrom &&
            msg.value == update_fee
        );
        
        domainDRPs[msg.sender].issuerName = _issuerName;
        domainDRPs[msg.sender].validTo = _validTo;
        
        emit Updated(msg.sender);
    }
    
    function purchaseDRP(address payable _domainAddr) external payable {
        DRP memory drp = domainDRPs[_domainAddr];
        require(clients[msg.sender].ccp.clientName != "" &&
            drp.reactContract != address(0) &&
            msg.value == drp.drpPrice
        );
        
        // add DRP to client drp list
        clients[msg.sender].purchasedDRP.push(_domainAddr);
        clients[msg.sender].lastChecked[_domainAddr] = 1; // this indicates that the DRP was purchased, but is not checked
        
        // transfer amount to domain address in DRP
        uint256 escrowAmount = (drp.drpPrice/100) * escrow * total_funds;
        escrowedAmount[_domainAddr] = escrowedAmount[_domainAddr] + escrowAmount;
        _domainAddr.transfer(drp.drpPrice - escrowAmount);
        
        emit DRPpurchased(msg.sender, _domainAddr, msg.value);
    }
    
    function checkCertificate(
        uint256 _drpIndex,
        bytes32[] calldata _sctLogID,
        uint256[] calldata _sctTimestamp,
        uint256 _certValidFrom,
        uint256 _certValidTo,
        string calldata _ocspRes
    ) external {
        CCP memory ccp = clients[msg.sender].ccp;
        DRP memory drp = domainDRPs[clients[msg.sender].purchasedDRP[_drpIndex]];
        DRPAbstract reactContract = DRPAbstract(drp.reactContract);
        require(ccp.clientAddress == msg.sender &&
            ccp.validTo >= now &&
            drp.validTo >= now &&
            drp.reactContract != address(0)
        );
        
        bool status = CheckAbstract(ccp.checkContract).check(_sctLogID, _sctTimestamp, _certValidFrom, _certValidTo, _ocspRes);
        if(!status){ // invalid certificate detected
            reactContract.trigger(
                drp.drpPrice,
                internal_misbehaviour,
                contract_fund_payment
            );
            uint256 misbehaviour_payment = (drp.drpPrice / 10)*internal_misbehaviour;
            
            // delete drp from drpList
            deleteDRPFromClientList(ccp.clientAddress, _drpIndex);
        
            // terminate DRP
            uint256 termination_payment_client = (drp.drpPrice/10)*(
                    termination_parameter +
                    ((drp.validTo - now)/(drp.validTo - drp.validFrom))*(termination_payment - termination_parameter)
                );
            // set reaction contract to empty address
            domainDRPs[drp.domainAddress].reactContract = address(0);
            
            // reduce domain's escrowed amount
            escrowedAmount[drp.domainAddress] = escrowedAmount[drp.domainAddress] - termination_payment_client;
            // transfer ether to client
            msg.sender.transfer(misbehaviour_payment + termination_payment_client);
            
            emit CertChecked(msg.sender, drp.domainAddress, status);
        }
        else{
            clients[ccp.clientAddress].lastChecked[drp.domainAddress] = now;
            emit CertChecked(msg.sender, drp.domainAddress, status);
        }
    }
    
    /* delete DRP from client DRP list */
    function deleteDRPFromClientList(address _clientAddr, uint256 _drpIndex) public{
        require(clients[_clientAddr].ccp.clientName != "");
        
        uint256 drpListLength = clients[_clientAddr].purchasedDRP.length;
        address domainAddr = clients[_clientAddr].purchasedDRP[_drpIndex];
        clients[_clientAddr].purchasedDRP[_drpIndex] = clients[_clientAddr].purchasedDRP[drpListLength - 1];
        delete clients[_clientAddr].purchasedDRP[drpListLength - 1];
        delete clients[_clientAddr].lastChecked[domainAddr];
        
        emit DRPDeleted(domainAddr);
    }
    
    /* function to expire DRP and delete it */
    function expireDRP() external{
        require(domainDRPs[msg.sender].domainAddress == msg.sender);
        DRP memory drp = domainDRPs[msg.sender];
        // transfer escrowed amount to domain
        uint256 escrowAmount = escrowedAmount[msg.sender];

        if(escrowAmount >= (drp.drpPrice/100) * escrow * total_funds){
            // domains DRP has not been triggered by client
            DRPAbstract(drp.reactContract).trigger(
                drp.drpPrice,
                internal_misbehaviour,
                contract_fund_payment
            );
            escrowAmount = escrowAmount + (drp.drpPrice / 10)*(internal_misbehaviour + contract_fund_payment);
        }
        
        delete escrowedAmount[msg.sender];
        
        // delete DRP from domainDRPs
        delete domainDRPs[msg.sender];
        msg.sender.transfer(escrowAmount);
    
        emit DRPExpired(msg.sender);
    }
    
    /* Getter functions */
    
    function isClientRegistered() external view returns(bool){
        return clients[msg.sender].ccp.clientName != "";
    }
    
    function isDomainRegistered() external view returns(bool){
        return domainDRPs[msg.sender].domainName != "";
    }
    
    /* get client details */
    function getClientDetails() external view returns(bytes32, uint256, uint256, address, address){
        CCP memory ccp = clients[msg.sender].ccp;
        require(ccp.clientName != "");
        return (
            ccp.clientName,
            ccp.validFrom,
            ccp.validTo,
            ccp.clientAddress,
            ccp.checkContract
        );
    }
    
    /* get domain details */
    function getDomainDetails() external view returns(bytes32, bytes32, uint256, uint256, uint256, address, address){
        DRP memory drp = domainDRPs[msg.sender];
        require(drp.domainName != "");
        return (
            drp.domainName,
            drp.issuerName,
            drp.validFrom,
            drp.validTo,
            drp.drpPrice,
            drp.domainAddress,
            drp.reactContract
        );
    }
    
    /* get details needed to purchase a DRP */
    function getDRPDetails(uint256 _drpIndex) external view returns(bytes32, uint256, address){
        DRP memory drp = domainDRPs[registeredDomains[_drpIndex]];
        if(drp.validTo >= now && drp.reactContract != address(0) && clients[msg.sender].lastChecked[drp.domainAddress] == 0)
            return (
              drp.domainName,
              drp.drpPrice,
              drp.domainAddress
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
        address drpAddr = clients[msg.sender].purchasedDRP[_drpIndex];
        DRP memory drp = domainDRPs[drpAddr];
        return (
            drp.domainName,
            drp.validFrom,
            drp.validTo,
            drp.drpPrice,
            clients[msg.sender].lastChecked[drpAddr]
        );
    }
    
    /* get CCP status */
    function getCCPStatus() external view returns(bool, bool){
        CCP memory ccp = clients[msg.sender].ccp;
        return (ccp.validTo >= now, ccp.checkContract != address(0)) ;
    }
    
    /* get DRP status */
    function getDRPStatus() external view returns(bool, bool){
        DRP memory drp = domainDRPs[msg.sender];
        return (drp.validTo > now, drp.reactContract != address(0));
    }
    
    /* get Domain escrow amount */
    function getEscrowAmount() external view returns(uint256){
        return escrowedAmount[msg.sender];
    }
    
    /* function to delete smart contract from blockchain */
    function destroyContract() external{
        require(msg.sender == contractOwner);
        selfdestruct(contractOwner);
    }
}
