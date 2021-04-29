import React, {Component} from 'react';
import Recaptcha from 'react-recaptcha';
import "./formstyle.module.css";
import { 
	Button,
	TextField,
	Link,
	Box,
	Typography,
  Popover 	
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FooterText from "../widgets/FooterText";
import { siteKey } from "../utils/constants";

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(10, 20),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
   
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));


class DRPRegistration extends Component {
	constructor(props){
    super(props);
    this.state={
      isVerified: false,
      openPopover: false,
      agree: false
    };
    this.togglePopover=this.togglePopover.bind(this);
    this.verifyCallback=this.verifyCallback.bind(this);
    this.checkboxHandler=this.checkboxHandler.bind(this);
    this.registerDRP=this.registerDRP.bind(this);
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

  togglePopover(){
    this.setState(prevState=>({
        openPopover:!prevState.openPopover    
      })
    );
  }

  registerDRP(){
    alert("Registration successful !")
  }

  render() {
  	const classes = this.props.classes;    
  	return (
    	<div className={classes.paper}>
     
	  		<Typography component="h1" variant="h5" align="center">
	    		Domain Reaction Poilcy Registeration
	  		</Typography>
	  		<form className={classes.form} id="domain_reg" noValidate>
          <TextField
            variant="outlined" margin="normal" required fullWidth
            id="domain_name" label="Domain Name"
            name="domain_name" autoFocus />
          <TextField
            variant="outlined" margin="normal" required fullWidth
            id="issuer" label="Issuer"
            name="issuer" />
          <TextField
            variant="outlined" margin="normal" required fullWidth
            id="domain_pay" label="Domain Pay Adress"
            name="domain_pay"  />
          <TextField
            variant="outlined" margin="normal" required fullWidth
            id="version" label="Version"
            name="version"  />

          <Box component="span" p={1} padding={1}>
            <TextField
                id="date"
                label="Valid From"
                color="secondary"
                type="date"
                defaultValue="2021-03-03"
              
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            
            <Box component="span" p={1} padding={1}>
              <TextField
                id="date"
                label="Valid To"
                color="secondary"
                type="date"
                defaultValue="2021-03-03"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
              />
          </Box>
          <TextField
            variant="outlined" margin="normal" required fullWidth
            id="domain_signature" label="Domain Certificate Signature"
            multiline rows={3}
            name="domain_signature"  />
          <TextField
            variant="outlined" margin="normal" required fullWidth
            id="contract_addr" label="Contract Adress"
            name="contract_addr"  />
          <input type="checkbox" id="agree"  onChange={this.checkboxHandler} />
          <label > I agree to</label>
          <Button  onClick={this.togglePopover}><b>terms and conditions.</b></Button>    
          <Popover
          
            open={this.state.openPopover}
            
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <Box p={3}><Typography className={classes.typography}><h3>TERMS AND CONDITIONS</h3><h5><p>There are benefits for your users, as well. Your <b>Terms and Conditions agreement</b> makes it clear to your users what you expect from them, what they are not allowed to do with your website/service, and how they must handle certain situations such as arbitration and canceling their own accounts.</p>
            Without a <b>Terms and Conditions agreement</b>, your rules and requirements won't be made public and provided to your users. This means your users may take advantage of your "lawless" platform.
            You may also get bombarded with questions from users asking about things that would otherwise be included in your Terms and Conditions agreement. For example, you may get a lot of questions asking how you handle user-generated content rights, or how a user can shut down an account..</h5></Typography>
            <Button variant="contained" color="primary" onClick={this.togglePopover}>close</Button></Box>
          </Popover>        
          <Box m={2} display= "inline">  
            <Recaptcha
              sitekey={{siteKey}}
              render="explicit"
              verifyCallback={this.verifyCallback}
            />
          </Box>       
          <Button disabled={!this.state.agree || !this.state.isVerified}
              type="submit" fullWidth variant="contained" color="primary"
              className={classes.submit} onClick={this.registerDRP}>
                  Register 
          </Button>
        </form>               	  			
				<Box mt={5}>  <FooterText />	</Box>
    	</div>
  );
 }
}

export default () => {
    const classes = useStyles();
    return (
        <DRPRegistration classes={classes} />
    )
}


