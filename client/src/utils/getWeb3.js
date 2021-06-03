import Web3 from "web3";

const getWeb3 = async() => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.request({
            method: "eth_requestAccounts"
          });
          // Accounts now exposed
          return web3;
        } catch (error) {
          throw error;
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        return web3;
      }
      // Do Not Fallback to localhost
      else {
        throw new Error("Please install metamask!");
      }
  }

export default getWeb3;
