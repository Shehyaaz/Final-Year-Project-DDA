import React, { Component } from 'react';
import Recaptcha from 'react-recaptcha';
import { 
	Button,
	TextField,
	Box,
	Dialog,
  DialogContent,
  DialogActions,
  DialogTitle, 	
  CircularProgress
} from '@material-ui/core';
import {
  Autocomplete
} from "@material-ui/lab";
import { siteKey } from "../utils/constants";
import AppContext from "../context/AppContext";

class PurchaseDRP extends Component {
	constructor(props){
    super(props);
    this.state={
      isVerified: false,
      isLoading: false,
      autoCompleteOpen: false,
      domains: [],
      selectedDomain: null
    };
    this.initialState = {...this.state};
    this.verifyCallback = this.verifyCallback.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handlePurchase = this.handlePurchase.bind(this);
    this.loadDomainData = this.loadDomainData.bind(this);
  }

  handleClose(){
    this.setState({
      ...this.initialState
    });
    this.props.onClose();
  }

  handlePurchase(domain){
    this.setState({
      ...this.initialState
    });
    this.props.onPurchase(domain);
  }

  verifyCallback(response){
    if(response){
      this.setState({
        isVerified: true
      });
    }
  }

  async loadDomainData(){
    this.setState({
      isLoading: true,

    });
    // load domain DRPs data
    const domains = [];
    const drpNum = await this.context.contract.methods.getNumDRP().call({
      from: this.context.account
    });
    for(let i = 0; i < parseInt(drpNum); i++){
        const domainData = await this.context.contract.methods.getDRPDetails(i).call({
          from: this.context.account
        }); // an array of values is returned
        if(domainData[1] !== "0"){
          domains.push({
            domainName: this.context.web3.utils.hexToUtf8(domainData[0]),
            drpPrice: this.context.web3.utils.fromWei(domainData[1], "ether"),
            domainAddress: domainData[2]
          });
        }
    }
    this.setState({
        isLoading: false,
        domains
    });
  }

  render() {
    const buttonDisabled = !this.state.isVerified || !this.state.selectedDomain;
    return (
      <Dialog open={this.props.open} aria-labelledby="purchase-drp">
        <DialogTitle id="purchase-drp">Purchase DRP</DialogTitle>
        <DialogContent>
          <Autocomplete 
            id="domain-name"
            open={this.state.autoCompleteOpen}
            onOpen={() => {
              this.setState({
                autoCompleteOpen: true
              });
              this.loadDomainData();
            }}
            onClose={() => this.setState({autoCompleteOpen: false})}
            loading={this.state.isLoading}
            onChange={(event, newValue) => {
              this.setState({
                selectedDomain: newValue
              });
            }}
            options={this.state.domains}
            getOptionLabel={(option) => option.domainName}
            renderOption={(option) => (
              <React.Fragment>
                {option.domainName} @ {option.drpPrice} ether
              </React.Fragment>
            )}
            renderInput={(params) => (
              <TextField {...params} 
                label="Select Domain" variant="outlined" required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {this.state.isLoading && <CircularProgress color="inherit" size={20} />}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}  
              />
            )}
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
    );
  }
}

PurchaseDRP.contextType = AppContext;
export default PurchaseDRP;


