import React, { Component } from "react";
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
// imported user-defined components
import Tabs from "../widgets/Tabs";
import ClientSignIn from "./ClientSignIn";
import DomainSignIn from "./DomainSignIn";

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(images/background.jpg)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  	display: 'flex', 
    alignItems: 'center', 
    justify: 'center'
  }
}));

class HomePage extends Component {
  render(){
  	  const classes = this.props.classes;
	  return (
	  	<Grid container component="main" className={classes.root}>
		  	<CssBaseline />
		  	<Grid item xs={false} sm={4} md={7} className={classes.image}>
		  		<Typography component="h2" variant="h3" style={{color : 'white', padding:'1rem'}}>
				    Welcome to <br /> Decentralised Domain Authentication
				</Typography>
		  	</Grid>
		  	<Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
				  <Tabs>
					<div label="Client">
					  <ClientSignIn />
					</div>
					<div label="Domain">
					  <DomainSignIn />
					</div>
				  </Tabs>
		  	</Grid>
		</Grid>
	  );
   }
}

export default () => {
    const classes = useStyles();
    return (
        <HomePage classes={classes} />
    )
}
