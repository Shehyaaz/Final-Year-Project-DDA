import React, { Component } from "react";
import {
    Grid,
    Backdrop,
	CircularProgress,
    Avatar,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Button,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from "@material-ui/core";
import {
    MonetizationOn,
    PersonAdd,
    VerifiedUserOutlined
} from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import CCPRegistration from "./CCPRegistration";
import PurchaseDRP from "./PurchaseDRP";
import AppContext from "../context/AppContext";

const useStyles = theme => ({
    root: {
        display: "flex",
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
    },
    avatar: {
        backgroundColor: red[500],
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
});

class ClientDashboard extends Component {
    constructor(props){
		super(props);
        this.state={
            account: '',
            isLoading: false,
            isRegistered: false,
            openRegistrationForm: false,
            openPurchaseForm: false,
            drpList: [],
            domains: []
        }
		this.handleRegisterCCP = this.handleRegisterCCP.bind(this);
        this.handlePurchaseDRP = this.handlePurchaseDRP.bind(this);
        this.handleDRPCheck = this.handleDRPCheck.bind(this);
	}

    handleDRPCheck(domainName){
        alert("Checked "+domainName);
    }

    DataRow = row => (
        <TableRow key={row.domainName}>
          <TableCell>{row.domainName}</TableCell>
          <TableCell>{row.lastChecked}</TableCell>
          <TableCell>
              <Button color="secondary" size="small" endIcon={<VerifiedUserOutlined/>}
                disableElevation
                onClick= {() => this.handleDRPCheck(row.domainName)}
              >
                  Check
              </Button>
          </TableCell>
        </TableRow>
    );
    
    handleRegisterCCP(clientDetails){
        this.setState({
            //isLoading: true,
            openRegistrationForm: false
        });
        console.log(clientDetails);
        // TODO: send details to Blockchain
        this.state.isRegistered
        ? console.log("Updated CCP")
        : console.log("Registered CCP");
    }

    handlePurchaseDRP(domainName){
        this.setState({
            //isLoading: true,
            openPurchaseForm: false
        });
        console.log("Purchased DRP: "+domainName);
        // TODO: send details to Blockchain
    }

    componentDidMount(){
        // TODO: check if client is already registered, get drp list, domain list and update state
        this.setState({
            account: this.context.account
        });        
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.account !== this.context.account){
            // TODO: get client data when ethereum account is changed
            this.setState({
                account: this.context.account
            });
        }
    }

    render() {
        const classes = this.props.classes;
        return (
            <div className={classes.root}>
                <Backdrop className={classes.backdrop} open={this.state.isLoading}>
					<CircularProgress color="inherit" />
				</Backdrop>
                <Grid 
					container 
					component="main" 
                    direction="column"
                    spacing = {8}
				>
                    <Grid
                        container
                        item
                        xs={12} 
						sm={12} 
						direction="row"
						alignItems="center"
						justify="center"
						spacing={6}
                    >
                        <Grid item xs={12} sm={6} >
                            <Card>
                                <CardHeader
                                    avatar={
                                    <Avatar aria-label="register ccp" className={classes.avatar}>
                                        <PersonAdd/>
                                    </Avatar>
                                    }
                                    title="Register"
                                />
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        To register in the system, the user(client) must specify a Client Check Policy
                                        or CCP
                                    </Typography>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Button color="primary"
                                        startIcon={<PersonAdd/>}
                                        onClick={() => this.setState({openRegistrationForm: true})}
                                        disableElevation
                                        size="small"    
                                    >
                                        { this.state.isRegistered 
                                        ? "Update CCP"
                                        : "Register CCP"}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} >
                            <Card>
                                <CardHeader
                                    avatar={
                                    <Avatar aria-label="purchase-drp" className={classes.avatar}>
                                        <MonetizationOn/>
                                    </Avatar>
                                    }
                                    title="Purchase"
                                />
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        To check a domain's certificate, the user(client) must first purchase
                                        the domain's Reaction Policy or DRP.
                                    </Typography>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Button color="primary"
                                        startIcon={<MonetizationOn/>}
                                        onClick={() => this.setState({openPurchaseForm:true})}    
                                        disableElevation
                                        size="small"
                                        disabled={!this.state.isRegistered}
                                    >
                                        Purchase DRP
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <Typography variant="h5" component="h5">
                            List of Purchased DRPs
                        </Typography>
                        <br />
                        <TableContainer component={Paper}>
                            <Table aria-label="drp table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Domain Name</TableCell>
                                        <TableCell>Action</TableCell>
                                        <TableCell>Last Checked</TableCell>                                        
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(this.state.drpList.length === 0)
                                    ? <TableRow>
                                        <TableCell align="center" colSpan="3">
                                            <Typography variant ="h6" component="h6">
                                                No data to display
                                            </Typography>
                                      </TableCell>
                                    </TableRow>
                                    : this.state.drpList.map((row) => this.DataRow(row) )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
                        
                <CCPRegistration 
                    open={this.state.openRegistrationForm}
                    onClose={() => this.setState({openRegistrationForm: false})}
                    update={this.state.isRegistered}
                    onRegister={(clientDetails) => this.handleRegisterCCP(clientDetails)}
                /> 

                <PurchaseDRP 
                    open={this.state.openPurchaseForm} 
                    onClose={() => this.setState({openPurchaseForm: false})}
                    domains={this.state.domains}
                    onPurchase={(domainName) => this.handlePurchaseDRP(domainName)}
                />
            </div>
        );
    }
}

ClientDashboard.contextType = AppContext;
export default withStyles(useStyles,{ withTheme: true })(ClientDashboard);
