import React, {Component,useState} from 'react';
import Popover from '@material-ui/core/Popover';
import Recaptcha from 'react-recaptcha';
import { 
	Button,
	TextField,
	Link,
	Box,
	MenuItem,
	Typography 	
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
// import user-defined components
import DividerText from "../widgets/DividerText";
import FileUpload from "../widgets/FileUpload";

function FooterText() {
  return (
    <Typography variant="caption" color="textSecondary" align="center">
      <Link color="inherit" href="">
      © Decentralised Domain Auth.
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

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
    margin: theme.spacing(2, 0, 2),
  },
 
}));


class CCPRegistration extends Component {
  constructor(props){
    super(props);
    this.state={
      isVerified: false,
      openPopover: false,
      agree: false
    };
    this.togglePopover=this.togglePopover.bind(this);
    this.recaptchaLoaded=this.recaptchaLoaded.bind(this);
    this.verifyCallback=this.verifyCallback.bind(this);
    this.checkboxHandler=this.checkboxHandler.bind(this);
    this.registerCCP=this.registerCCP.bind(this);
  }
  recaptchaLoaded(){
    console.log('Captch is loaded.');
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
    }));
   }
   togglePopover(){
    this.setState(prevState=>({
      openPopover:!prevState.openPopover    
    }));
   }
   registerCCP(){
     alert("Registration successful !")
   }
   
  render() {
  	const classes = this.props.classes;
  
// executed once the captcha has been verified
// can be used to post forms, redirect, etc.
const verifyCallback = function (response) {
  console.log(response);
  document.getElementById("someForm").submit();
};

    
  	return (
    	<div className={classes.paper}>
     
	  		<Typography component="h1" variant="h5" align="center" display="block">
	    		Client Check Policy Registeration
	  		</Typography>
	  		<form className={classes.form} id="client_sign_in" noValidate>
	    		    <TextField
	      			variant="outlined" margin="normal" required fullWidth
	      			id="client_name" label="Client Name"
	      			name="client_name" autoFocus />
                      <TextField
	      			variant="outlined" margin="normal" required fullWidth
	      			id="client_pay" label="Client Pay Adress"
	      			name="client_pay"  />
              <TextField
	      			variant="outlined" margin="normal" required fullWidth
	      			id="version" label="Version"
	      			name="version"  />
              

              <Box component="span" p={1} padding={1}>
              <TextField
                  id="date"
                  label="Validate From"
                  type="date"
                  defaultValue="2021-03-03"
                  color="secondary"
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                </Box>

                <Box component="span" p={1} padding={1}>
                <TextField
                  id="date"
                  label="Validate To"
                  type="date"
                  color="secondary"
                  defaultValue="2021-03-03"
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
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
          <p>
          <Box m={2}  justifyContent="center">  
          <Recaptcha
            sitekey="6Ldn85EaAAAAAHbh1dh0nD7FWQ8pt6BQvF_LbwIy"
            render="explicit"
            onloadCallback={this.recaptchaLoaded}
            verifyCallback={this.verifyCallback}
          />
          </Box> 
          </p>      
           <Button disabled={!this.state.agree || !this.state.isVerified}
              type="submit" fullWidth variant="contained" color="primary"
              className={classes.submit} onClick={this.registerDRP}>
                  Register 
          </Button>
     	  			
				<Box mt={5}>  <FooterText />	</Box>
  </form>
</div>
  );
 }
}

export default () => {
    const classes = useStyles();

    return (
     
        <CCPRegistration classes={classes} />
       
    )
}


