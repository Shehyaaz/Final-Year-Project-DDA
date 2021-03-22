const Constants = artifacts.require("./Constants.sol");
const CheckInterface = artifacts.require("./CheckInterface.sol");
const DRPReactionInterface = artifacts.require("./DRPReactionInterface.sol");
const Check = artifacts.require("./Check.sol");
const DRPReaction = artifacts.require("./DRPReaction.sol");
const DDA = artifacts.require("./DDA.sol");

module.exports = function(deployer) {
 deployer.deploy(Constants);
 deployer.deploy(CheckInterface);
 deployer.deploy(DRPReactionInterface);
 deployer.deploy(Check);
 deployer.deploy(DRPReaction);
 deployer.deploy(DDA);
};
