const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");    // Useful for deploying to a public network.
require("dotenv").config(); // load .env file

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    docker: {
      host: "ganache", // name of container running ganache
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, process.env.RINKEBY_API),
      network_id: 4,       // Rinkeby's id
      gas: 8000000,        // Rinkeby gas limit
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true,    // Skip dry run before migrations? (default: false for public nets )
      networkCheckTimeout: 10000000
    },
  },
  compilers: {
    solc: {
        version: "0.6.1" // ex:  "0.5.16". (Default: Truffle's installed solc)
    }
}
};
