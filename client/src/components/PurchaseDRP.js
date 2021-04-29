import React, {Component} from 'react';
import Popover from '@material-ui/core/Popover';
import Recaptcha from 'react-recaptcha';
import "./formstyle.module.css";
import { 
	Button,
	TextField,
	Link,
	Box,
	Typography 	
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
// import user-defined components


function FooterText() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
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
    marginTop: theme.spacing(8),
   
  },
  submit: {
    margin: theme.spacing(6, 0, 2),
  },
}));


class PurchaseDRP extends Component {
	constructor(props){
    super(props)

    this.handleSubscribe=this.handleSubscribe.bind(this);
    this.recaptchaLoaded=this.recaptchaLoaded.bind(this);
    this.verifyCallback=this.verifyCallback.bind(this);
    this.state={
      isVerified: false
    }
  }
  recaptchaLoaded(){
    console.log('Captch is loaded.');
  }
   handleSubscribe(){
     if(this.state.isVerified){
       alert('You have successfully verified!');
     }else{
      alert('Please verify you are a human!');

     }

   }   
   verifyCallback(response){
    if(response){
      this.setState({
        isVerified: true
      });
    }
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
     
	  		<Typography component="h1" variant="h5" align="center">
	    		Purchase DRP
	  		</Typography>
	  		<form className={classes.form} id="client_sign_in" noValidate>
	    		    <TextField
	      			variant="outlined" margin="normal" required fullWidth
	      			id="Domain_name" label="Domaint Name"
	      			name="Domain_name" autoFocus />
 
            <Button
              type="submit" fullWidth disabled={!this.state.isVerified} variant="contained" color="secondary"
              className={classes.submit}>
              purchase
              </Button>
            </form>			
           
     
          <Box m={2} display= "inline">  
          <Recaptcha
            sitekey="6Ldn85EaAAAAAHbh1dh0nD7FWQ8pt6BQvF_LbwIy"
            render="explicit"
            onloadCallback={this.recaptchaLoaded}
            verifyCallback={this.verifyCallback}
          /></Box>
     	  			
				<Box mt={5}>  <FooterText />	</Box>

    	</div>
  );
 }
}

export default () => {
    const classes = useStyles();

    return (
     
        <PurchaseDRP classes={classes} />
       
    )
}


