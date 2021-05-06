import React, { Component } from 'react';
import AppContext from "../context/AppContext";

class Account extends Component {
    render() {
        return (
            <div>
                Your Account : {this.context.account}
            </div>
        );
    }
}

Account.contextType = AppContext;
export default Account;
