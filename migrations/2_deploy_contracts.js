const Check = artifacts.require("./Check.sol");
const DRPReaction = artifacts.require("./DRPReaction.sol");
const DDA = artifacts.require("./DDA.sol");

// load trustedCTLogs file
const trustedCTLogs = require("../ctlogs/trustedCTLogs.json");
let logIDs = [];
for(const log of trustedCTLogs){
    logIDs.push(log["log_id"]);
}

module.exports = function(deployer) {
 deployer.deploy(Check);
 deployer.deploy(DRPReaction);
 deployer.deploy(DDA, logIDs);
};
