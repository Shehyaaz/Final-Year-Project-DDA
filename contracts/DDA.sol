/*
This is a smart contract to implement the functionality of Decentralised Domain Authentication on Ethereum blockchain.
Authors : Mohammed Sufiyan Aman, Riyanchhi Agrawal, Shakshi Pandey, Shehyaaz Khan Nayazi
*/

pragma solidity ^0.5.0;

import "./SafeMath.sol";
import "./CheckInterface.sol";
import "./DRPReactionInterface.sol";

contract DDA {
    using SafeMath for uint256;
    
    /* the log ID of the CT logs trusted by DDA are stored in ctLogsID array */
    bytes32[] public ctLogIDs;
    uint24 public constant maximum_merge_delay = 86400;
    /* contract owner address */
    address payable public contractOwner;
    
    /* parameters used to determine various payments in this contract */
    uint8 constant private escrow = 5; // escrow parameter = 50% (NOTE: escrow parameter < 62.5 % given the below set of parameters)
    uint8 constant private termination_parameter = 2; // termination parameter = 20% 
    uint8 constant private internal_misbehaviour = 9; // internal misbehaviour payment = 90%\
    uint8 constant private contract_fund_payment = 3; // contract fund payment = 30%
    uint8 constant private termination_payment = 4; // termination payment = 40%
    uint8 constant private den = 10; // common denominator
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
    event Registered(address _addr, bool _registered);
    event Updated(address _addr, bool _updated);
    event DRPpurchased(address _clientAddr, address _domainAddr, uint256 _amount);
    event DRPAlreadyPurchased(address _domainAddr);
    event CertChecked(address _clientAddr, address _domainAddr, bool _check);
    event InvalidContract(address _contract, bool status);
    event ValidityError(address  _contract, bool isCCP);
    event DRPExpired(address _domainAddr);
    event DRPDeleted(address _domainAddr);
    
    constructor(bytes32[] memory _ctLogIDs) public {
        contractOwner = msg.sender;
        for(uint256 i = 0; i < _ctLogIDs.length; i++){
            ctLogIDs.push(_ctLogIDs[i]);
        }
    }
    
    function isClientRegistered() external view returns(bool){
        return clients[msg.sender].ccp.clientName != "";
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
            CheckInterface(_checkContract).verifyAddress(_checkContract)
        );
        
        clients[msg.sender].ccp = CCP(_name, _validFrom, _validTo, msg.sender, _checkContract, _version);
        
        emit Registered(msg.sender, true);
    }
    
    function updateClient(
        uint256 _validFrom,
        uint256 _validTo,
        address _checkContract
    ) external payable{
        require(clients[msg.sender].ccp.clientName != "" &&
            _validTo > _validFrom &&
            msg.value == client_update_fee &&
            CheckInterface(_checkContract).verifyAddress(_checkContract)
        );
        
        clients[msg.sender].ccp.validFrom = _validFrom;
        clients[msg.sender].ccp.validTo = _validTo;
        clients[msg.sender].ccp.checkContract = _checkContract;
        
        emit Updated(msg.sender, true);
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
            DRPReactionInterface(_reactContract).verifyAddress(_reactContract)
        );
        
        domainDRPs[msg.sender] = DRP(_domainName, _issuerName, _validFrom, _validTo, _drpPrice, msg.sender, _reactContract, uint8(_version));
        registeredDomains.push(msg.sender); // add domain address to list of registered addresses
        
        emit Registered(msg.sender, true);
    }
    
    function updateDomain(
        bytes32 _issuerName,
        uint256 _validFrom,
        uint256 _validTo,
        uint256 _drpPrice,
        address _reactContract
    ) external payable{
        require(domainDRPs[msg.sender].domainName != "" &&
            _issuerName != "" &&
            _validTo > _validFrom &&
            msg.value == domain_update_fee &&
            DRPReactionInterface(_reactContract).verifyAddress(_reactContract)
        );
        
        domainDRPs[msg.sender].issuerName = _issuerName;
        domainDRPs[msg.sender].validFrom = _validFrom;
        domainDRPs[msg.sender].validTo = _validTo;
        domainDRPs[msg.sender].drpPrice = _drpPrice;
        domainDRPs[msg.sender].reactContract = _reactContract;
        
        emit Updated(msg.sender, true);
    }
    
    function purchaseDRP(address payable _domainAddr) external payable {
        uint256 drpPrice = domainDRPs[_domainAddr].drpPrice;
        require(clients[msg.sender].drpList[_domainAddr].domainName != "" && 
            msg.value == drpPrice
        );
        
        // add DRP to client drp list
        clients[msg.sender].drpList[_domainAddr] = domainDRPs[_domainAddr];
        clients[msg.sender].purchasedDRP.push(_domainAddr);
        
        // transfer amount to domain address in DRP
        uint256 escrowAmount = drpPrice.mul(escrow * total_funds) / (den*den);
        escrowedAmount[_domainAddr] = escrowedAmount[_domainAddr].add(escrowAmount);
        _domainAddr.transfer(drpPrice - escrowAmount);
        
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
        require(ccp.clientAddress == msg.sender &&
            _drpIndex < clients[msg.sender].purchasedDRP.length
        );
        if(ccp.validFrom > now || ccp.validTo < now){
            emit ValidityError(ccp.checkContract, true);
            return;
        }
        
        DRP memory drp = clients[msg.sender].drpList[clients[msg.sender].purchasedDRP[_drpIndex]];
        if(drp.validFrom > now || drp.validTo < now){
            emit ValidityError(drp.reactContract, false);
            return;
        }
        
        DRPReactionInterface reactContract = DRPReactionInterface(drp.reactContract);
        if( !reactContract.verifyAddress(drp.reactContract)){
            emit InvalidContract(drp.reactContract, true);
            return;
        }
        
        bool status = CheckInterface(ccp.checkContract).check(ctLogIDs, sctLogID, sctTimestamp, maximum_merge_delay, certValidFrom, certValidTo);
        
        if(!status){ // invalid certificate detected
            reactContract.trigger(
                drp.drpPrice,
                internal_misbehaviour,
                contract_fund_payment,
                den
            );
            uint256 misbehaviour_payment = drp.drpPrice.mul(internal_misbehaviour) / den;
            
            // delete drp from drpList
            deleteDRP(_drpIndex);

            // terminate DRP
            uint256 termination_payment_client = drp.drpPrice.mul(termination_parameter) / den + 
                drp.drpPrice.mul(termination_payment - termination_parameter).mul(now - drp.validTo).div(drp.validTo - drp.validFrom) / den;
            reactContract.terminate(); // destroys reaction contract
            
            // reduce domain's escrowed amount
            escrowedAmount[drp.domainAddress] = escrowedAmount[drp.domainAddress].sub(termination_payment_client);
            // transfer ether to client
            msg.sender.transfer(misbehaviour_payment + termination_payment_client);

            emit CertChecked(msg.sender, drp.domainAddress, false);
        }
        
        clients[msg.sender].lastChecked[drp.domainAddress] = now;
        emit CertChecked(msg.sender, drp.domainAddress, true);
    }
    
    /* delete DRP from client DRP list */
    function deleteDRP(uint256 _drpIndex) public{
        uint256 drpListLength = clients[msg.sender].purchasedDRP.length;
        require(_drpIndex < drpListLength &&
            clients[msg.sender].ccp.clientName != ""
        );
        
        address domainAddr = clients[msg.sender].purchasedDRP[_drpIndex];
        clients[msg.sender].purchasedDRP[_drpIndex] = clients[msg.sender].purchasedDRP[drpListLength.sub(1)];
        clients[msg.sender].purchasedDRP.length = drpListLength.sub(1);
        delete clients[msg.sender].drpList[domainAddr];
        
        emit DRPDeleted(domainAddr);
    }
    
    /* function to expire DRP */
    function expire() external{
        require(domainDRPs[msg.sender].domainAddress == msg.sender);
        // delete DRP from domainDRPs
        delete domainDRPs[msg.sender];
        // transfer escrowed amount to domain
        uint256 escrowAmount = escrowedAmount[msg.sender];
        escrowedAmount[msg.sender] = 0;
        msg.sender.transfer(escrowAmount);
    
        emit DRPExpired(msg.sender);
    }
    
    /* get details needed to purchase a DRP */
    function getDRPPurchaseDetails(uint256 _drpIndex) external view returns(bytes32, uint256, address, uint8){
        require(_drpIndex < registeredDomains.length);
        address drpAddr = registeredDomains[_drpIndex];
        
        DRPReactionInterface reactContract = DRPReactionInterface(domainDRPs[drpAddr].reactContract);
        if(domainDRPs[drpAddr].validTo >= now && reactContract.verifyAddress(domainDRPs[drpAddr].reactContract))
            return (
              domainDRPs[drpAddr].domainName,
              domainDRPs[drpAddr].drpPrice,
              drpAddr,
              domainDRPs[drpAddr].version
            );
        
        return ("", 0, address(0), 0);
    }
    
    /* get client DRP list details */
    function getClientDRPList(uint256 _drpIndex) external view returns(bytes32, uint256, uint256, uint256, uint256, address){
        require(_drpIndex < clients[msg.sender].purchasedDRP.length);
        
        address drpAddr = clients[msg.sender].purchasedDRP[_drpIndex];
        DRP memory drp = clients[msg.sender].drpList[drpAddr];
        return (
            drp.domainName,
            drp.validFrom,
            drp.validTo,
            drp.drpPrice,
            clients[msg.sender].lastChecked[drpAddr],
            drpAddr
        );
    }
    
    /* function to delete smart contract from blockchain */
    function close() public{
        require(msg.sender == contractOwner);
        selfdestruct(contractOwner);
    }
}
