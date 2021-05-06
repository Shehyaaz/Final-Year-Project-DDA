import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import {
	Button,
	Backdrop,
	CircularProgress,
	CssBaseline,
	Grid,
	Typography
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import logo from "../assets/metamask.svg";
import getWeb3 from "../utils/getWeb3";
import AppContext from "../context/AppContext";

const useStyles = theme => ({
  root: {
	height: "100vh",
	backgroundImage: "url(/images/background.jpg)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
	display: "flex",
  },
  title: {
	  color: "#1c1c1c",
	  padding: "0.5rem",
	  textAlign: "center",
  },
  divider: {
	  color: "#a1a1a1",
  },
  logo: {
	  height: "1.5em",
  },
  backdrop: {
	zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
});

class HomePage extends Component {
	constructor(props){
		super(props);
		this.state = {
			isLoading: false,
			isLoggedIn: (sessionStorage.getItem("isLoggedIn") === "true") || false
		};
		// binding this
		this.handleLogin = this.handleLogin.bind(this);
	}

	async handleLogin() {
		this.setState({
			isLoading: true
		});
		// connect to blockchain network
		try {
			// Get network provider and web3 instance.
			const web3 = await getWeb3();
			
			// Use web3 to get the user's accounts.
			const accounts = await web3.eth.getAccounts();
	
			// Get the contract instance.
			//const networkId = await web3.eth.net.getId();
			// const deployedNetwork = SimpleStorageContract.networks[networkId];
			const instance = 10;
			// const instance = new web3.eth.Contract(
			// 	SimpleStorageContract.abi,
			// 	deployedNetwork && deployedNetwork.address,
			// );
		
			if( web3 != null && accounts != null && instance != null  ){
				// update context
				this.context.setContext({
					web3: web3, 
					contract: instance, 
					account: accounts[0],
				});
				sessionStorage.setItem("isLoggedIn", true);
				this.setState({
					isLoading: false,
					isLoggedIn: true
				});
			}
			else {
				throw new Error("Failed to load web3, accounts, or contract !");
			}
		} catch (error) {
			// Catch any errors for any of the above operations.
			this.setState({isLoading: false});
			alert("Something unexpected occurred :(\n"+error);
		}
	}

	render() {
		const classes = this.props.classes;
		if(this.state.isLoggedIn){
			return (
				<Redirect 
					to = {{
						pathname: "/dashboard/about"
					}}
				/>
			);
		}
		return (
			<div className={classes.root}>
				<Backdrop className={classes.backdrop} open={this.state.isLoading}>
					<CircularProgress color="inherit" />
				</Backdrop>
				<Grid 
					container 
					component="main" 
					direction="row-reverse"
					alignItems="center"
					justify="center"
				>
					<CssBaseline />
					<Grid 
						container 
						item
						xs={12} 
						sm={8} 
						direction="column"
						alignItems="center"
						justify="center"
						spacing={6}
					>
						<Grid item xs={12} sm={6} >
							<img src="/favicon.png" alt="dda-logo" height={100}/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Typography component="h3" variant="h3" className={classes.title}>
								Decentralised Domain Authentication
							</Typography>
						</Grid>
						<Grid item xs={12} sm={6} >
							<Button variant="contained" color="primary"
								endIcon={<img src={logo} alt="metamask-logo" className={classes.logo}/>}
								onClick={this.handleLogin}
							>
								Login using MetaMask
							</Button>
						</Grid>
					</Grid>
					<Grid item xs={false} sm={4}>
						{/* Empty Grid element for spacing */}
					</Grid>
				</Grid>
			</div>
		);
	}
}

HomePage.contextType = AppContext;

export default withStyles(useStyles, {withTheme: true})(HomePage);