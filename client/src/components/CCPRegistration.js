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
      isRegistered: false,
      agree: false,
      error: false,
      errorMessage: '',
      clientName: '',
      clientPay: '',
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
    const clientData = await this.context.contract.methods.getClientDetails().call({
      from: this.context.account
    });
    this.setState({
      clientName: this.context.web3.utils.hexToUtf8(clientData[0]),
      validFrom: new Date(parseInt(clientData[1])*1000).toISOString().split("T")[0],
      validTo: new Date(parseInt(clientData[2])*1000).toISOString().split("T")[0],
      clientPay: clientData[3],
      ccpAddress: clientData[4]
    });
  }

  componentDidMount = async() => {
    this.setState({
      isLoading: true
    });
    const isRegistered = await this.context.contract.methods.isClientRegistered().call({
      from: this.context.account
    });
    if(isRegistered){
      await this.getClientData();
    }
    this.setState({
      isLoading: false,
      isRegistered
    });
  }

  render() {
    const {isLoading, isRegistered, isVerified, agree, error, errorMessage, ...clientDetails} = {...this.state};
    const buttonDisabled = !(isVerified && agree && clientDetails.clientName
                            && clientDetails.ccpAddress);
  	return (
      <Dialog open={this.props.open} aria-labelledby="register-ccp">
        <DialogTitle id="register-ccp">Client Check Policy Registration</DialogTitle>
          {isLoading
          ? <div>
              <DialogContent>
                <CircularProgress color = "secondary"/>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleClose} color="secondary">
                  Cancel
                </Button>
              </DialogActions>
            </div>
          : <div>
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
                  value={clientDetails.clientPay || this.context.account}
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
                          readOnly: isRegistered
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
                  {isRegistered ? "Update":"Register"}
                </Button>
              </DialogActions>
            </div>
          }    
        </Dialog>
    );
  }
}

CCPRegistration.contextType = AppContext;
export default CCPRegistration;


