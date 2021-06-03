/*
This is a smart contract to implement the functionality of Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

import "./CheckInterface.sol";
import "./DRPInterface.sol";

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
    uint256 constant public client_registration_fee = 0.05 ether;
    uint256 constant public domain_registration_fee = 0.1 ether;
    uint256 constant public client_update_fee = 0.01 ether;
    uint256 constant public domain_update_fee = 0.05 ether;

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
        address reactContract;
        uint8 version;
    }
    
    struct Client {
        CCP ccp;
        address[] purchasedDRP;
        mapping(address => DRP) drpList;
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
            msg.value == client_registration_fee &&
            CheckInterface(_checkContract).verifyCCPAddress(_checkContract)
        );
        
        clients[msg.sender].ccp = CCP(_name, _validFrom, _validTo, msg.sender, _checkContract, _version);
        
        emit Registered(msg.sender);
    }
    
    function updateClient(
        uint256 _validTo,
        address _checkContract
    ) external payable{
        require(clients[msg.sender].ccp.clientName != "" &&
            _validTo > clients[msg.sender].ccp.validFrom &&
            msg.value == client_update_fee &&
            CheckInterface(_checkContract).verifyCCPAddress(_checkContract)
        );
        
        clients[msg.sender].ccp.validTo = _validTo;
        clients[msg.sender].ccp.checkContract = _checkContract;
        
        emit Updated(msg.sender);
    }
    
    function registerDomain(
        bytes32 _domainName,
        bytes32 _issuerName,
        uint256 _validFrom,
        uint256 _validTo,
        uint256 _drpPrice,
        address _reactContract,
        uint8 _version
    ) external payable{
        require(domainDRPs[msg.sender].domainName == "" &&
            _domainName != "" &&
            _issuerName != "" &&
            _validTo > _validFrom &&
            msg.value == domain_registration_fee &&
            DRPInterface(_reactContract).verifyDRPAddress(_reactContract)
        );
        
        domainDRPs[msg.sender] = DRP(_domainName, _issuerName, _validFrom, _validTo, _drpPrice, msg.sender, _reactContract, _version);
        registeredDomains.push(msg.sender); // add domain address to list of registered addresses
        
        emit Registered(msg.sender);
    }
    
    function updateDomain(
        bytes32 _issuerName,
        uint256 _validTo,
        uint256 _drpPrice,
        address _reactContract
    ) external payable{
        require(domainDRPs[msg.sender].domainName != "" &&
            _issuerName != "" &&
            _validTo > domainDRPs[msg.sender].validFrom &&
            msg.value == domain_update_fee &&
            DRPInterface(_reactContract).verifyDRPAddress(_reactContract)
        );
        
        domainDRPs[msg.sender].issuerName = _issuerName;
        domainDRPs[msg.sender].validTo = _validTo;
        domainDRPs[msg.sender].drpPrice = _drpPrice;
        domainDRPs[msg.sender].reactContract = _reactContract;
        
        emit Updated(msg.sender);
    }
    
    function purchaseDRP(address payable _domainAddr) external payable {
        DRP memory drp = domainDRPs[_domainAddr];
        require(clients[msg.sender].ccp.clientName != "" &&
            clients[msg.sender].drpList[_domainAddr].domainName == "" &&
            DRPInterface(drp.reactContract).verifyDRPAddress(drp.reactContract) &&
            msg.value == drp.drpPrice
        );
        
        // add DRP to client drp list
        clients[msg.sender].drpList[_domainAddr] = drp;
        clients[msg.sender].purchasedDRP.push(_domainAddr);
        
        // transfer amount to domain address in DRP
        uint256 escrowAmount = (drp.drpPrice/100) *escrow * total_funds;
        escrowedAmount[_domainAddr] = escrowedAmount[_domainAddr] + escrowAmount;
        _domainAddr.transfer(drp.drpPrice - escrowAmount);
        
        emit DRPpurchased(msg.sender, _domainAddr, msg.value);
    }
    
    function checkCertificate(
        uint256 _drpIndex,
        bytes32[] calldata sctLogID,
        uint256[] calldata sctTimestamp,
        uint256 certValidFrom,
        uint256 certValidTo
    ) external {
        CCP memory ccp = clients[msg.sender].ccp;
        DRP memory drp = clients[msg.sender].drpList[clients[msg.sender].purchasedDRP[_drpIndex]];
        DRPInterface reactContract = DRPInterface(drp.reactContract);
        require(ccp.clientAddress == msg.sender &&
            ccp.validTo >= now &&
            drp.validTo >= now &&
            reactContract.verifyDRPAddress(drp.reactContract)
        );
        
        bool status = CheckInterface(ccp.checkContract).check(ctLogIDs, sctLogID, sctTimestamp, maximum_merge_delay, certValidFrom, certValidTo);
        
        if(!status){ // invalid certificate detected
            reactContract.trigger(
                drp.drpPrice,
                internal_misbehaviour,
                contract_fund_payment
            );
            uint256 misbehaviour_payment = (drp.drpPrice / 10)*internal_misbehaviour;
            
            // delete drp from drpList
            deleteDRPFromClientList(_drpIndex);

            // terminate DRP
            uint256 termination_payment_client = (drp.drpPrice/10)*(
                    termination_parameter +
                    ((now - drp.validTo)/(drp.validTo - drp.validFrom))*(termination_payment - termination_parameter)
                );
            reactContract.terminate(); // destroys reaction contract
            
            // reduce domain's escrowed amount
            escrowedAmount[drp.domainAddress] = escrowedAmount[drp.domainAddress] - termination_payment_client;
            // transfer ether to client
            msg.sender.transfer(misbehaviour_payment + termination_payment_client);

            emit CertChecked(msg.sender, drp.domainAddress, false);
        }
        
        clients[msg.sender].lastChecked[drp.domainAddress] = now;
        emit CertChecked(msg.sender, drp.domainAddress, true);
    }
    
    /* delete DRP from client DRP list */
    function deleteDRPFromClientList(uint256 _drpIndex) public{
        require(clients[msg.sender].ccp.clientName != "");
        
        uint256 drpListLength = clients[msg.sender].purchasedDRP.length;
        address domainAddr = clients[msg.sender].purchasedDRP[_drpIndex];
        clients[msg.sender].purchasedDRP[_drpIndex] = clients[msg.sender].purchasedDRP[drpListLength - 1];
        clients[msg.sender].purchasedDRP.length = drpListLength - 1;
        delete clients[msg.sender].drpList[domainAddr];
        
        emit DRPDeleted(domainAddr);
    }
    
    /* function to expire DRP and delete it */
    function expireDRP() external{
        require(domainDRPs[msg.sender].domainAddress == msg.sender);
        // delete DRP from domainDRPs
        delete domainDRPs[msg.sender];
        // transfer escrowed amount to domain
        uint256 escrowAmount = escrowedAmount[msg.sender];
        escrowedAmount[msg.sender] = 0;
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
        if(drp.validTo >= now && DRPInterface(drp.reactContract).verifyDRPAddress(drp.reactContract))
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
        DRP memory drp = clients[msg.sender].drpList[drpAddr];
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
        return (ccp.validTo >= now, CheckInterface(ccp.checkContract).verifyCCPAddress(ccp.checkContract)) ;
    }
    
    /* get DRP status */
    function getDRPStatus() external view returns(bool, bool){
        DRP memory drp = domainDRPs[msg.sender];
        return (drp.validTo > now, DRPInterface(drp.reactContract).verifyDRPAddress(drp.reactContract));
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
