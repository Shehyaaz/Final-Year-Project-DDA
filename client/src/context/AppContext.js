import React from "react";

// AppContext contains web3 instance and the smart contract object
const AppContext = React.createContext({
    web3: null,
    contract: null,
    account: "",
    setContext: ()=>{}
  });

export default AppContext;