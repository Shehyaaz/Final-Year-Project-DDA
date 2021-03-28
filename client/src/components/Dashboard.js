import React, { Component } from "react";
import { Redirect } from "react-router";
import AppContext from "../context/AppContext";

class Dashboard extends Component {
    constructor(props){
        super(props);
        this.state = {
            account: (props.location.state && props.location.state.account) || "",
            isLoggedIn:  (props.location.state && props.location.state.isLoggedIn) || false
        };
    }

    componentDidMount(){
        window.ethereum.on("accountsChanged",(accounts)=>{
            this.setState({
                account: accounts[0]
            });
        })
    }

    componentWillUnmount(){
        window.ethereum.off("accountsChanged",(accounts)=>{
            this.setState({
                account: accounts[0]
            });
        });
    }

    render() {
        if(!this.state.isLoggedIn){
            return(
                <Redirect to = "/" />
            );
        }
        return (
            <div>
                Dashboard<br />
                Your account: {this.state.account} <br />
            </div>
        );
    }
}

Dashboard.contextType = AppContext;

export default Dashboard;
