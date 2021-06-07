const DRPReaction = artifacts.require("./DRPReaction.sol");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(DRPReaction, {
        from: accounts[2]
    });
};