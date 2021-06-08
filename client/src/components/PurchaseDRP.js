import React, { Component } from 'react';
import Recaptcha from 'react-recaptcha';
import { 
	Button,
	TextField,
	Box,
	Dialog,
  DialogContent,
<<<<<<< HEAD
  DialogContentText,
=======
>>>>>>> origin/test
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
<<<<<<< HEAD
=======
      autoCompleteOpen: false,
>>>>>>> origin/test
      domains: [],
      selectedDomain: null
    };
    this.initialState = {...this.state};
    this.verifyCallback = this.verifyCallback.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handlePurchase = this.handlePurchase.bind(this);
<<<<<<< HEAD
=======
    this.loadDomainData = this.loadDomainData.bind(this);
>>>>>>> origin/test
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
<<<<<<< HEAD

  componentDidMount = async() => {
      this.setState({
        isLoading: true
      });
      // load domain DRPs data
      const domains = [];
      const drpNum = await this.context.contract.methods.getNumDRP().call();
      for(let i = 0; i < drpNum; i++){
          const [domainName, drpPrice, domainAddress] = await this.context.contract.methods.getDRPDetails(i).call(); // an array of values is returned
          domains.push({
              domainName: this.context.web3.utils.hexToUtf8(domainName),
              drpPrice: parseFloat(this.context.web3.utils.fromWei(drpPrice, "ether")),
              domainAddress
          });
      }
      this.setState({
          isLoading: false,
          domains,
          selectedDomain: domains[0]
      });
  }

  render() {
    const buttonDisabled = !this.state.isVerified || !this.state.selectedDomain;
    return (
      <Dialog open={this.props.open} aria-labelledby="purchase-drp">
        <DialogTitle id="purchase-drp">Purchase DRP</DialogTitle>
          {this.state.isLoading
            ? <div>
                <DialogContent>
                  <CircularProgress color = "secondary" />
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleClose} color="secondary">
                    Cancel
                  </Button>
                </DialogActions>
              </div>
            : (this.state.domains.length > 0)
                ? <div>
                    <DialogContent>
                      <Autocomplete 
                        id="domain-name"
                        value={this.state.selectedDomain.domainName}
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
                  </div>
                : <div>
                    <DialogContent>
                      <DialogContentText>
                        There are no DRPs to purchase, please try again later.
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.handleClose} color="secondary">
                        Cancel
                      </Button>
                    </DialogActions>
                  </div>
          } 
      </Dialog>
  );
 }
}

PurchaseDRP.contextType = AppContext;
export default PurchaseDRP;
=======

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
        if(domainData !== undefined && domainData[1] !== "0"){
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
      <Dialog open={this.props.open} aria-labelledby="purchase-drp"
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle id="purchase-drp">Purchase DRP</DialogTitle>
        <DialogContent dividers>
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
>>>>>>> origin/test

PurchaseDRP.contextType = AppContext;
export default PurchaseDRP;


