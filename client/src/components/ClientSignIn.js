import React, {Component} from 'react';
import { 
	Button,
	TextField,
	Link,
	Box,
	Typography 	
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
// import user-defined components
import DividerText from "../widgets/DividerText";
import FileUpload from "../widgets/FileUpload";

function FooterText() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Link color="inherit" href="">
        Decentralised Domain Auth.
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

class ClientSignIn extends Component {

  render() {
  	const classes = this.props.classes;
  	return (
    	<div className={classes.paper}>
	  		<Typography component="h1" variant="h5" align="center">
	    		Sign in
	  		</Typography>
	  		<form className={classes.form} id="client_sign_in" noValidate>
	    		<TextField
	      			variant="outlined" margin="normal" required fullWidth
	      			id="client_pay" label="Client Pay Address"
	      			name="client_pay" autoFocus />
				<Button
				  type="submit" fullWidth variant="contained" color="primary"
				  className={classes.submit}>
	      			Sign In
	    		</Button>
	    	</form>
			<DividerText>Or</DividerText>
			<form className={classes.form} id="client_reg" noValidate>
				<Typography style={{marginBottom: '1rem'}} component="h1" variant="h5" align="center">
	    			Register
	  			</Typography>
	  			<FileUpload label="Upload Client Check Policy" color="#f50057" />
	  			<Button
				  type="submit" fullWidth variant="contained" color="primary"
				  className={classes.submit}>
	      			Register Client
	    		</Button>
				<Box mt={5}>
				  <FooterText />
				</Box>
			</form>
    	</div>
  );
 }
}

export default () => {
    const classes = useStyles();
    return (
        <ClientSignIn classes={classes} />
    )
}
