const Check = artifacts.require("./Check.sol");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(Check, {
        from: accounts[1]
    });
};