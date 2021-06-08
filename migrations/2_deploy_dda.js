const DDA = artifacts.require("./DDA.sol");

// load trustedCTLogs file
const trustedCTLogs = require("../server/ctlogs/trustedCTLogs.json");
const logIDs = [];
for(const log of trustedCTLogs){
    logIDs.push(log["log_id"]);
}

module.exports = function(deployer, network, accounts) {
    deployer.deploy(DDA, logIDs,{
        from: accounts[0]
    });
};
