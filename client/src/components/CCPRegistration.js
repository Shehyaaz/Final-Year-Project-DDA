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
import { siteKey } from "../utils/constants";
import AppContext from '../context/AppContext';

class CCPRegistration extends Component {
  constructor(props, context){
    super(props);
    this.state={
      isVerified: false,
      agree: false,
      clientName: '',
      version: '',
      validFrom: new Date().toISOString().split("T")[0],
      validTo: new Date().toISOString().split("T")[0],
      ccpAddress: ''
    };
    this.initialState = {...this.state};
    this.updateFormState = this.updateFormState.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.checkboxHandler = this.checkboxHandler.bind(this);
  }
  
  handleClose(){
    this.setState({
      ...this.initialState
    });
    this.props.onClose();
  }

  handleRegister(clientDetails){
    this.setState({
      ...this.initialState
    });
    this.props.onRegister(clientDetails);
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

  componentDidMount(){
    if(this.props.update){
      // TODO: load CCP values from blockchain
    }
  }

  render() {
    const {isVerified, agree, ...clientDetails} = {...this.state};
    const buttonDisabled = !(isVerified && agree && clientDetails.clientName
                            && clientDetails.version && clientDetails.ccpAddress);
    clientDetails.clientPay = this.context.account;
  	return (
    <Dialog open={this.props.open} aria-labelledby="register-ccp">
      <DialogTitle id="register-ccp">Client Check Policy Registration</DialogTitle>
      <DialogContent>
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
          onChange={this.updateFormState} 
        />              
        <Box component="span" p={1} padding={1}>
          <TextField
            name="validFrom"
            label="Valid From"
            type="date"
            color="secondary"
            value={clientDetails.validFrom}
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
            color="secondary"
            value={clientDetails.validTo}
            onChange={this.updateFormState}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
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


