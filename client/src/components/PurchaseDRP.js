import React, { Component } from 'react';
import Recaptcha from 'react-recaptcha';
import { 
	Button,
	TextField,
	Box,
	Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle 	
} from '@material-ui/core';
import {
  Autocomplete
} from "@material-ui/lab";
import { siteKey } from "../utils/constants";

class PurchaseDRP extends Component {
	constructor(props){
    super(props);
    this.state={
      isVerified: false,
      selectedDomain: this.props.domains.length && this.props.domains[0]
    };
    this.initialState = {...this.state};
    this.verifyCallback = this.verifyCallback.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handlePurchase = this.handlePurchase.bind(this);
  }

  handleClose(){
    this.setState({
      ...this.initialState
    });
    this.props.onClose();
  }

  handlePurchase(domainName){
    this.setState({
      ...this.initialState
    });
    this.props.onPurchase(domainName);
  }

  verifyCallback(response){
    if(response){
      this.setState({
        isVerified: true
      });
    }
  }

  render() {
    const buttonDisabled = !this.state.isVerified || !this.state.selectedDomain;
    return (
      (this.props.domains.length > 0)
        ? <Dialog open={this.props.open} aria-labelledby="purchase-drp">
            <DialogTitle id="purchase-drp">Purchase DRP</DialogTitle>
            <DialogContent>
              <Autocomplete 
                id="domain-name"
                value={this.state.domainName}
                onChange={(event, newValue) => {
                  this.setState({
                    selectedDomain: newValue
                  });
                }}
                options={this.props.domains}
                getOptionLabel={(option) => option.domainName+" ("+option.drpPrice+" ether)"}
                renderInput={(params) => <TextField {...params} label="Domain Name" variant="outlined" required/>}
              />
              <Box m={2}  justifyContent="center">  
                <Recaptcha
                  sitekey={siteKey}
                  render="explicit"
                  verifyCallback={this.verifyCallback}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="secondary">
                Cancel
              </Button>
              <Button
                disabled={buttonDisabled} color="primary"
                onClick={() => this.handlePurchase(this.state.selectedDomain)}
              >
                Purchase
              </Button>
            </DialogActions>		     	  			
    	    </Dialog>
        : <Dialog open={this.props.open} aria-labelledby="purchase-drp">
            <DialogTitle id="purchase-drp">Purchase DRP</DialogTitle>
            <DialogContent>
              <DialogContentText>
                There are no DRPs to purchase, please try again later
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="secondary">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
  );
 }
}

export default PurchaseDRP;


