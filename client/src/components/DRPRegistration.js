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

class DRPRegistration extends Component {
	constructor(props){
    super(props);
    this.state={
      isLoading: false,
      isVerified: false,
      agree: false,
      error: false,
      errorMessage: '',
      domainName: '',
      issuer: '',
      version: 1,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: new Date().toISOString().split("T")[0],
      drpAddress: '',
      price: 0
    };
    this.initialState = {...this.state};
    this.handleClose = this.handleClose.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.checkboxHandler = this.checkboxHandler.bind(this);
    this.validateFields = this.validateFields.bind(this);
    this.getDomainData = this.getDomainData.bind(this);
  }

  handleClose(){
    this.setState({
      ...this.initialState
    });
    this.props.onClose();
  }

  async getDomainData(){
    // get domain DRP data
    const [domainName, issuerName, validFrom, validTo, drpPrice, domainAddress, reactContract] = await this.context.contract.getClientDetails().call();
    this.setState({
      domainName: this.context.web3.utils.hexToUtf8(domainName),
      issuer: this.context.web3.utils.hexToUtf8(issuerName),
      validFrom: new Date(validFrom).toISOString().split("T")[0],
      validTo: new Date(validTo).toISOString().split("T")[0],
      domainAddress,
      drpAddress: reactContract,
      price: parseFloat(this.context.web3.utils.fromWei(drpPrice, "ether"))
    });
  }

  handleRegister = async(domainDetails) => {
    if(this.validateFields(domainDetails)){
      this.setState({
        ...this.initialState
      });
      domainDetails.version = parseInt(domainDetails.version);
      domainDetails.price = parseFloat(domainDetails.price);
      this.props.onRegister(domainDetails);
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
    else if(domainDetails.issuer.search(domainDetails.domainName) === -1)
      errorMessage = "Domain must be a sub-domain of DRP issuer!";
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

  componentDidMount = async() => {
    if(this.props.update){
      this.setState({
        isLoading: true
      });
      await this.getDomainData();
      this.setState({
        isLoading: false
      });
    }
  }

  render() { 
    const {isLoading, isVerified, agree, error, errorMessage, ...domainDetails} = {...this.state};
    const buttonDisabled = !(isVerified && agree && domainDetails.domainName && domainDetails.issuer
                              && domainDetails.drpAddress && domainDetails.price);
    domainDetails.domainPay = this.context.account;
  	return (
      <Dialog open={this.props.open} aria-labelledby="register-drp">
        <DialogTitle id="register-drp">Domain Reaction Policy Registration</DialogTitle>
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
                  label="Domain Name" name="domainName" autoFocus 
                  value={domainDetails.domainName}
                  onChange={this.updateFormState}
                  InputProps={{
                    readOnly: this.props.update
                  }}
                />
                <TextField
                  variant="outlined" margin="normal" required fullWidth
                  label="DRP Issuer" name="issuer" 
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
                  value={domainDetails.version}
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
                        value={domainDetails.validFrom}
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
                      value={domainDetails.validTo}
                      onChange={this.updateFormState}
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>
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
                <div>
                  <input type="checkbox" name="agree" checked={agree} onChange={this.checkboxHandler} />
                  <label > I agree to</label>
                  <Tooltip title="Check out the About page" arrow>
                    <Button><b>Terms and Conditions.</b></Button>
                  </Tooltip>
                </div>
                <Box m={2}  display="flex" alignItems="center" justifyContent="center">  
                  <Recaptcha
                    ref={e => this.captcha = e}
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
            </div>
          }
        </Dialog>
    );
  }
}

DRPRegistration.contextType = AppContext;
export default DRPRegistration;


