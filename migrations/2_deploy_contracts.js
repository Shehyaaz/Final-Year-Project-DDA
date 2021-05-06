const Constants = artifacts.require("./Constants.sol");
const Check = artifacts.require("./Check.sol");
const DRPReaction = artifacts.require("./DRPReaction.sol");
const DDA = artifacts.require("./DDA.sol");

// load trustedCTLogs file
const trustedCTLogs = require("../ctlogs/trustedCTLogs.json");
let logIDs = [];
for(const log of trustedCTLogs){
    logIDs.push("0x"+Buffer.from(log["log_id"],"base64").toString("hex"));
}

module.exports = function(deployer) {
 deployer.deploy(Constants);
 deployer.deploy(Check);
 deployer.deploy(DRPReaction);
 deployer.deploy(DDA, logIDs);
};
