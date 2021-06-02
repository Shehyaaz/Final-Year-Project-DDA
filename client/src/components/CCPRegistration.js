import React, {Component} from 'react';
import Recaptcha from 'react-recaptcha';
import { 
	Button,
	TextField,
	Box,
  Grid,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  CircularProgress
} from '@material-ui/core';
import {
  Alert
} from "@material-ui/lab";
import { siteKey } from "../utils/constants";
import AppContext from '../context/AppContext';

class CCPRegistration extends Component {
  constructor(props, context){
    super(props);
    this.state={
      isLoading: false,
      isVerified: false,
      agree: false,
      error: false,
      errorMessage: '',
      clientName: '',
      version: 1,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: new Date().toISOString().split("T")[0],
      ccpAddress: ''
    };
    this.initialState = {...this.state};
    this.handleClose = this.handleClose.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.checkboxHandler = this.checkboxHandler.bind(this);
    this.validateFiels = this.validateFiels.bind(this);
    this.getClientData = this.getClientData.bind(this);
  }
  
  handleClose(){
    this.setState({
      ...this.initialState
    });
    this.props.onClose();
  }

  handleRegister(clientDetails){
    if(this.validateFiels(clientDetails)){
      this.setState({
        ...this.initialState
      });
      clientDetails.version = parseInt(clientDetails.version);
      this.props.onRegister(clientDetails);
    }
  }

  validateFiels(clientDetails){
    const addressRegEx = /^(0[xX])[A-Fa-f0-9]{40}$/;
    let errorMessage = "";
    if(new Date(clientDetails.validFrom).getTime() >= new Date(clientDetails.validTo).getTime())
      errorMessage = "CCP Validity must be more than a day";
    else if(!addressRegEx.test(clientDetails.ccpAddress))
      errorMessage = "Invalid CCP address";
    
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

  async getClientData(){
    // get client CCP data
    const [clientName, validFrom, validTo, clientAddress, checkContract] = await this.context.contract.getClientDetails().call();
    this.setState({
      clientName: this.context.web3.utils.hexToUtf8(clientName),
      validFrom: new Date(validFrom).toISOString().split("T")[0],
      validTo: new Date(validTo).toISOString().split("T")[0],
      clientAddress,
      ccpAddress: checkContract
    });
  }

  componentDidMount = async() => {
    if(this.props.update){
      this.setState({
        isLoading: true
      });
      await this.getClientData();
      this.setState({
        isLoading: false
      });
    }
  }

  render() {
    const {isLoading, isVerified, agree, error, errorMessage, ...clientDetails} = {...this.state};
    const buttonDisabled = !(isVerified && agree && clientDetails.clientName
                            && clientDetails.ccpAddress);
    clientDetails.clientPay = this.context.account;
  	return (
      (isLoading) 
        ?<CircularProgress color = "secondary"/>
        :<Dialog open={this.props.open} aria-labelledby="register-ccp">
          <DialogTitle id="register-ccp">Client Check Policy Registration</DialogTitle>
          <DialogContent>
            {error && 
                <Alert severity="error">{errorMessage}</Alert>
            }
            <TextField
              variant="outlined" margin="normal" required fullWidth
              label="Client Name" name="clientName" autoFocus 
              value={clientDetails.clientName}
              onChange={this.updateFormState}
              InputProps={{
                readOnly: this.props.update
              }}
            />
            <TextField
              variant="outlined" margin="normal" required fullWidth
              label="Client Pay Adress" name="clientPay" 
              value={clientDetails.clientPay}
              InputProps={{
                readOnly: true
              }}
            />
            <TextField
              variant="outlined" margin="normal" required fullWidth
              label="Version" name="version"  
              value={clientDetails.version}
              InputProps={{
                readOnly: true
              }}
            />
            <Grid container direction="row" spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                    name="validFrom"
                    label="Valid From"
                    type="date"
                    value={clientDetails.validFrom}
                    onChange={this.updateFormState}
                    fullWidth 
                    required
                    InputProps={{
                      readOnly: this.props.update
                    }}
                  />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="validTo"
                  label="Valid To"
                  type="date"
                  value={clientDetails.validTo}
                  onChange={this.updateFormState}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <TextField
              variant="outlined" margin="normal" required fullWidth
              label="Contract Adress" name="ccpAddress"
              value={clientDetails.ccpAddress}
              onChange={this.updateFormState} 
            />
            <input type="checkbox" name="agree" onChange={this.checkboxHandler} />
            <label > I agree to</label>
            <Tooltip title="Check out the About page" arrow>
              <Button><b>Terms and Conditions.</b></Button>
            </Tooltip>
            <Box m={2}  display="flex" alignItems="center" justifyContent="center">  
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
              onClick={() => this.handleRegister(clientDetails)}>
              {this.props.update ? "Update":"Register"}
            </Button>
          </DialogActions>    
        </Dialog>
    );
  }
}

CCPRegistration.contextType = AppContext;
export default CCPRegistration;


