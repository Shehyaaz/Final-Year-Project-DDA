import React, {Component} from 'react';
import Recaptcha from 'react-recaptcha';
import { 
	Button,
	TextField,
	Box,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle
} from '@material-ui/core';
import {
  Alert
} from "@material-ui/lab";
import { siteKey } from "../utils/constants";
import AppContext from '../context/AppContext';
import getSCTList from '../utils/getSCTList';

class DRPRegistration extends Component {
	constructor(props){
    super(props);
    this.state={
      isVerified: false,
      agree: false,
      error: false,
      errorMessage: '',
      domainName: '',
      issuer: '',
      version: 0,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: new Date().toISOString().split("T")[0],
      drpAddress: '',
      price: 0,
      certFile: '',
    };
    this.initialState = {...this.state};
    this.handleClose = this.handleClose.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.checkboxHandler = this.checkboxHandler.bind(this);
    this.validateFields = this.validateFields.bind(this);
  }

  handleClose(){
    this.setState({
      ...this.initialState
    });
    this.props.onClose();
  }

  handleRegister = async(domainDetails) => {
    if(this.validateFields(domainDetails)){
      this.setState({
        ...this.initialState
      });
        const reader = new FileReader();
        reader.onload = async(e) => {
          try{
            domainDetails.sctList =  getSCTList(e.target.result);
            domainDetails.version = parseInt(domainDetails.version);
            domainDetails.price = parseFloat(domainDetails.price);
            this.props.onRegister(domainDetails);
          } catch(err){
            this.setState({
              error: true,
              errorMessage: err.message
            });
          }
        }
        reader.readAsText(domainDetails.certFile);
      }
  }

  validateFields(domainDetails){
    const domainRegEx = /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/;
    const addressRegEx = /^(0[xX])[A-Fa-f0-9]{40}$/;
    let errorMessage = "";
    if(!domainRegEx.test(domainDetails.domainName))
      errorMessage = "Domain name is invalid!";
    else if(!domainRegEx.test(domainDetails.issuer))
      errorMessage = "Issuer name is invalid!";
    else if(isNaN(domainDetails.version) || parseFloat(domainDetails.version) % 1 !== 0 || parseFloat(domainDetails.version) <= 0)
      errorMessage = "Version must be a positive number such as 1, 2, etc. !";
    else if(isNaN(domainDetails.price) || parseFloat(domainDetails.price) <= 0)
      errorMessage = "Invalid or negative price!";
    else if(new Date(domainDetails.validFrom).getTime() >= new Date(domainDetails.validTo).getTime())
      errorMessage = "DRP Validity must be more than a day";
    else if(!addressRegEx.test(domainDetails.drpAddress))
      errorMessage = "Invalid DRP address";
    
    if (errorMessage){
      this.setState({
        error: true,
        errorMessage
      });
      return false;
    }
    
    return true;
  }

  verifyCallback(response){
    if(response){
      this.setState({
        isVerified: true
      });
    }
  }

  checkboxHandler(){
    this.setState(prevState=>({
        agree: !prevState.agree      
      })
    );
  }
  
  updateFormState = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  updateFileName = (event) => {
    this.setState({
      certFile: event.target.files[0]
    });
  }

  componentDidMount(){
    if(this.props.update){
      // TODO: load DRP values from blockchain
    }
  }

  render() { 
    const {isVerified, agree, error, errorMessage, ...domainDetails} = {...this.state};
    const buttonDisabled = !(isVerified && agree && domainDetails.domainName && domainDetails.issuer
                              && domainDetails.version && domainDetails.drpAddress
                              && domainDetails.price && domainDetails.certFile);
    domainDetails.domainPay = this.context.account;
  	return (
    	<Dialog open={this.props.open} aria-labelledby="register-drp">
        <DialogTitle id="register-drp">Domain Reaction Policy Registration</DialogTitle>
        <DialogContent>
          {this.state.error && 
            <Alert severity="error">{this.state.errorMessage}</Alert>
          }
          <TextField
            variant="outlined" margin="normal" required fullWidth
            label="Domain Name" name="domainName" autoFocus 
            value={domainDetails.domainName}
            onChange={this.updateFormState}
            InputProps={{
              readOnly: this.props.update
            }}
          />
          <TextField
            variant="outlined" margin="normal" required fullWidth
            label="Issuer" name="issuer" 
            value={domainDetails.issuer}
            onChange={this.updateFormState}
          />
          <TextField
            variant="outlined" margin="normal" required fullWidth
            label="Domain Pay Adress" name="domain_pay"  
            value={domainDetails.domainPay}
            InputProps={{
              readOnly: true
            }}  
          />
          <TextField
            variant="outlined" margin="normal" required fullWidth
            label="Version" name="version"
            value={domainDetails.version ? domainDetails.version : ''}
            onChange={this.updateFormState}  
          />
          <Box component="span" p={1} padding={1}>
            <TextField
                name="validFrom"
                label="Valid From"
                type="date"
                value={domainDetails.validFrom}
                onChange={this.updateFormState}
                InputLabelProps={{
                  shrink: true,
                }}
              />
          </Box>  
          <Box component="span" p={1} padding={1}>
            <TextField
              name="validTo"
              label="Valid To"
              type="date"
              value={domainDetails.validTo}
              onChange={this.updateFormState}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          <TextField
            variant="outlined" margin="normal" required fullWidth
            label="Contract Adress" name="drpAddress"
            value={domainDetails.drpAddress}
            onChange={this.updateFormState}  
          />
          <TextField
            variant="outlined" margin="normal" required fullWidth
            label="DRP Price(in ether)" name="price"
            value={domainDetails.price ? domainDetails.price : ''}
            onChange={this.updateFormState}  
          />
          <Button
            variant="contained"
            color="primary"
            component="label"
            size="medium"
          >
            Select Certificate File
            <input
              type="file"
              hidden
              accept=".pem,.crt,.cer"
              onChange={this.updateFileName}
            />
          </Button>
          <Box component="span" p={1} padding={1}>
            <TextField
              name="certFile"
              label="Certificate File"
              value={domainDetails.certFile && domainDetails.certFile.name}
              disabled
            />
          </Box>
          <div>
            <input type="checkbox" name="agree" onChange={this.checkboxHandler} />
            <label > I agree to</label>
            <Tooltip title="Check out the About page" arrow>
              <Button><b>Terms and Conditions.</b></Button>
            </Tooltip>
          </div>
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
          <Button disabled={buttonDisabled}
              color="primary"
              onClick={() => this.handleRegister(domainDetails)}>
            {this.props.update ? "Update":"Register"}
          </Button>
        </DialogActions>
      </Dialog>
  );
 }
}

DRPRegistration.contextType = AppContext;
export default DRPRegistration;


