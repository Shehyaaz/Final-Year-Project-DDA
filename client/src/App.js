import React, { Component } from "react";
import { 
  BrowserRouter,
  Route,
  Switch
} from "react-router-dom";
import AppContext from "./context/AppContext";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      web3: null,
      contract: null,
      account: "",
      setContext: this.setContext
    };
    this.setContext = this.setContext.bind(this);
  }

<<<<<<< HEAD
  setContext = ({web3, contract, account}) => {
    this.setState({web3, contract, account});
=======
  setContext = (context) => {
    this.setState({...context});
>>>>>>> origin/test
  }

	render() {
		return (
      <BrowserRouter>
        <AppContext.Provider value={this.state} >
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/dashboard" render={(props) => <Dashboard {...props}/>} />
          </Switch>
        </AppContext.Provider>
      </BrowserRouter>
		);
  }
}

export default App;
