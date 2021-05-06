import React, { Component } from "react";
import { 
  BrowserRouter,
  Route,
  Switch
} from "react-router-dom";
import AppContext from "./context/AppContext";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import About from "./components/About"

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

  setContext = ({web3, contract, account}) => {
    this.setState({web3, contract, account});
  }

	render() {
		return (
      <BrowserRouter>
        <AppContext.Provider value={this.state} >
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/about" component={About} />
            <Route path="/dashboard" render={(props) => <Dashboard {...props}/>} />
          </Switch>
        </AppContext.Provider>
      </BrowserRouter>
		);
  }
}

export default App;
