import React, { Component } from "react";
import {
    Backdrop,
	CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
<<<<<<< HEAD
    Grid
=======
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
>>>>>>> origin/test
} from "@material-ui/core";
import {
    Today,
    ContactMail,
    Dns,
    AttachMoney,
    AccountTree,
    Person,
    ExpandMore,
    AccountCircle,
<<<<<<< HEAD
    AccountBalanceWallet,
=======
>>>>>>> origin/test
    CheckCircle,
    Cancel
} from "@material-ui/icons";
import { 
    green,
    red 
} from '@material-ui/core/colors';
import { withStyles } from "@material-ui/core/styles";
import AppContext from "../context/AppContext";

const useStyles = theme => ({
    root: {
      display: "flex",
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
<<<<<<< HEAD
      fontWeight: theme.typography.fontWeightRegular,
=======
      fontWeight: theme.typography.fontWeightBold,
>>>>>>> origin/test
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
});

class Account extends Component {
    constructor(props){
		super(props);
        this.state={
            account: '',
<<<<<<< HEAD
            balance: 0,
=======
>>>>>>> origin/test
            isLoading: false,
            clientRegistered: false,
            domainRegistered: false,
            clientDetails: {
                clientName: "",
                validFrom: "",
                validTo: "",
                clientAddress: "",
                ccpAddress: "",
                ccpStatus: false,
                ccpStatusMssg: ""
            },
            domainDetails: {
                domainName: "",
                issuer: "",
                validFrom: "",
                validTo: "",
                domainAddress: "",
                drpAddress: "",
                price: 0,
                escrowAmount: 0,
                drpStatus: false,
                drpStatusMssg: ""
            }
        }
<<<<<<< HEAD
        this.getClientData = this.getClientData.bind(this);
        this.getDomainData = this.getDomainData.bind(this);
        this.getBalance = this.getBalance.bind(this);
        this.getDataFromBlockchain = this.getDataFromBlockchain.bind(this);
	}

    async getBalance(){
        try{
            await this.context.web3.eth.getBalance(this.state.account, (err, balance) => {
                if(balance){
                    this.setState({
                        balance: this.context.web3.utils.fromWei(balance, "ether")
                    });
                }
                else{
                    alert("Error getting balance: "+err.message);
                }
            });
        }
        catch(err){
            alert("Error getting balance: "+err.message);
        }
    }
    
    async getClientData(){
        // get client CCP data
        const [ccpValidityStatus, ccpContractStatus] = await this.context.contract.methods.getCCPStatus().call();
        const [clientName, validFrom, validTo, clientAddress, checkContract] = await this.context.contract.getClientDetails().call();
        let ccpStatusMssg = "";
        if(ccpValidityStatus && ccpContractStatus){
            ccpStatusMssg = "CCP valid";
        }
        else if(ccpValidityStatus && !ccpContractStatus){
            ccpStatusMssg = "CCP Check Contract is invalid";
        }
        else if(!ccpValidityStatus && ccpContractStatus){
=======
        this.initialState = {...this.state};
        this.getClientData = this.getClientData.bind(this);
        this.getDomainData = this.getDomainData.bind(this);
        this.getDataFromBlockchain = this.getDataFromBlockchain.bind(this);
	}
    
    async getClientData(){
        // get client CCP data
        const status = await this.context.contract.methods.getCCPStatus().call({
            from: this.state.account
        });
        const clientData = await this.context.contract.methods.getClientDetails().call({
            from: this.state.account
        });
        let ccpStatusMssg = "";
        if(status[0] && status[1]){
            ccpStatusMssg = "CCP valid";
        }
        else if(status[0] && !status[1]){
            ccpStatusMssg = "CCP Check Contract is invalid";
        }
        else if(!status[0] && status[1]){
>>>>>>> origin/test
            ccpStatusMssg = "CCP validity has expired";
        }
        else{
            ccpStatusMssg = "CCP validity has expired and CCP Check Contract is invalid";
        }
        this.setState({
          clientDetails: {
<<<<<<< HEAD
            clientName: this.context.web3.utils.hexToUtf8(clientName),
            validFrom: new Date(validFrom).toISOString().split("T")[0],
            validTo: new Date(validTo).toISOString().split("T")[0],
            clientAddress,
            ccpAddress: checkContract,
            ccpStatus: ccpValidityStatus && ccpContractStatus,
=======
            clientName: this.context.web3.utils.hexToUtf8(clientData[0]),
            validFrom: new Date(parseInt(clientData[1])*1000).toISOString().split("T")[0],
            validTo: new Date(parseInt(clientData[2])*1000).toISOString().split("T")[0],
            clientAddress: clientData[3],
            ccpAddress: clientData[4],
            ccpStatus: status[0] && status[1],
>>>>>>> origin/test
            ccpStatusMssg
          }
        });
    }

    async getDomainData(){
<<<<<<< HEAD
        // get escrow amount
        const escrowAmount = await this.context.contract.methods.getEscrowAmount().call();
        // get domain DRP data
        const [drpValidityStatus, drpContractStatus] = await this.context.contract.methods.getDRPPStatus().call();
        const [domainName, issuerName, validFrom, validTo, drpPrice, domainAddress, reactContract] = await this.context.contract.getClientDetails().call();
        
        let drpStatusMssg = "";
        if(drpValidityStatus && drpContractStatus){
            drpStatusMssg = "DRP valid";
        }
        else if(drpValidityStatus && !drpContractStatus){
            drpStatusMssg = "DRP React Contract is invalid";
        }
        else if(!drpValidityStatus && drpContractStatus){
=======
        // get domain DRP data
        const status = await this.context.contract.methods.getDRPStatus().call({
            from: this.state.account
        });
        const domainData = await this.context.contract.methods.getDomainDetails().call({
            from: this.state.account
        });
        
        let drpStatusMssg = "";
        if(status[0] && status[1]){
            drpStatusMssg = "DRP valid";
        }
        else if(status[0] && !status[1]){
            drpStatusMssg = "DRP React Contract is invalid";
        }
        else if(!status[0] && status[1]){
>>>>>>> origin/test
            drpStatusMssg = "DRP validity has expired";
        }
        else{
            drpStatusMssg = "DRP validity has expired and DRP React Contract is either invalid or has been terminated";
        }
        
        this.setState({
            domainDetails: {
<<<<<<< HEAD
                domainName: this.context.web3.utils.hexToUtf8(domainName),
                issuer: this.context.web3.utils.hexToUtf8(issuerName),
                validFrom: new Date(validFrom).toISOString().split("T")[0],
                validTo: new Date(validTo).toISOString().split("T")[0],
                domainAddress,
                drpAddress: reactContract,
                price: parseFloat(this.context.web3.utils.fromWei(drpPrice, "ether")),
                escrowAmount: parseFloat(this.context.web3.utils.fromWei(escrowAmount, "ether")),
                drpStatus: drpValidityStatus && drpContractStatus,
=======
                domainName: this.context.web3.utils.hexToUtf8(domainData[0]),
                issuer: this.context.web3.utils.hexToUtf8(domainData[1]),
                validFrom: new Date(parseInt(domainData[2])*1000).toISOString().split("T")[0],
                validTo: new Date(parseInt(domainData[3])*1000).toISOString().split("T")[0],
                price: this.context.web3.utils.fromWei(domainData[4].toString(), "ether"),
                domainAddress: domainData[5],
                drpAddress: domainData[6],
                escrowAmount: this.context.web3.utils.fromWei(domainData[7], "ether"),
                drpStatus: status[0] && status[1],
>>>>>>> origin/test
                drpStatusMssg
            }
        });
    }

    async getDataFromBlockchain(){
<<<<<<< HEAD
        await this.getBalance();
        const clientRegistered = await this.context.contract.methods.isClientRegistered().call();
        const domainRegistered = await this.context.contract.methods.isDomainRegistered().call();
        if(clientRegistered){
            await this.getClientData();
        }
        if(domainRegistered){
            await this.getDomainData();
        }
=======
        const clientRegistered = await this.context.contract.methods.isClientRegistered().call({
            from: this.state.account
        });
        const domainRegistered = await this.context.contract.methods.isDomainRegistered().call({
            from: this.state.account
        });
        if(clientRegistered){
            await this.getClientData();
        }
        else{
            this.setState({
                clientDetails: this.initialState.clientDetails
            });
        }
        if(domainRegistered){
            await this.getDomainData();
        }
        else{
            this.setState({
                domainDetails: this.initialState.domainDetails
            });
        }
>>>>>>> origin/test
        this.setState({
            clientRegistered,
            domainRegistered
        });
    }

    componentDidMount = async() => {
        this.setState({
            account: this.context.account,
            isLoading: true
        });
        // get data from blockchain
        await this.getDataFromBlockchain();
        this.setState({
            isLoading: false
        });
    }
    
    componentDidUpdate = async(prevProps, prevState) => {
        if(prevState.account !== this.context.account){
            this.setState({
                account: this.context.account,
                isLoading: true
            });
            // get data from blockchain
            await this.getDataFromBlockchain();
            this.setState({
                isLoading: false
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
<<<<<<< HEAD
                    justify="center"
                    alignItems="center"
=======
                    alignItems="stretch"
>>>>>>> origin/test
                    spacing = {8}
                >
                    <Grid 
                        container 
                        item 
                        xs={12}
                        justify="center"
                        alignItems="stretch"
<<<<<<< HEAD
                        spacing = {2}
                    >
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="account-content"
                            >
                                <Typography className={classes.heading}>Your Account Details</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid item xs={12}>
                                    <AccountCircle />
                                    <Typography>Account Address: </Typography>
                                    <Typography>{this.state.account}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <AccountBalanceWallet />
                                    <Typography>Account Balance: </Typography>
                                    <Typography>{this.state.balance}</Typography>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
=======
                        direction="column"
                        spacing = {2}
                    >
                        <Typography variant="h4" component="h4">
                            View Account Details
                        </Typography>
                        <br />
                        <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls="account-content"
                        >
                            <Typography className={classes.heading}>Account Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List component="nav">
                                <ListItem button>
                                    <ListItemIcon>
                                        <AccountCircle />
                                    </ListItemIcon>
                                    <ListItemText primary={"Account Address : "+this.state.account} />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
>>>>>>> origin/test
                    </Grid>
                    <Grid 
                        container 
                        item 
                        xs={12}
                        justify="center"
                        alignItems="stretch"
<<<<<<< HEAD
=======
                        direction="column"
>>>>>>> origin/test
                        spacing = {2}
                    >
                        <Accordion disabled = {! this.state.clientRegistered}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="client-content"
                            >
                                <Typography className={classes.heading}>Client Details</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
<<<<<<< HEAD
                                <Grid item xs={12}>
                                    <AccountCircle />
                                    <Typography>Client Name: </Typography>
                                    <Typography>{this.state.clientDetails.clientName}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Today />
                                    <Typography>Valid From: </Typography>
                                    <Typography>{this.state.clientDetails.validFrom}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Today />
                                    <Typography>Valid To: </Typography>
                                    <Typography>{this.state.clientDetails.validTo}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <ContactMail />
                                    <Typography>Client Pay Address: </Typography>
                                    <Typography>{this.state.clientDetails.clientAddress}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Dns />
                                    <Typography>Check Contract Address: </Typography>
                                    <Typography>{this.state.clientDetails.ccpAddress}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <AccountTree />
                                    <Typography>Version: </Typography>
                                    <Typography>{1}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    { this.state.clientDetails.ccpStatus 
                                        ? <CheckCircle style={{ color: green[500] }} />
                                        : <Cancel style={{ color: red[500] }} />

                                    }
                                    <Typography>CCP Status: </Typography>
                                    <Typography>{this.state.ccpStatusMssg}</Typography>
                                </Grid>
=======
                                <List component="nav">
                                    <ListItem button>
                                        <ListItemIcon>
                                            <AccountCircle />
                                        </ListItemIcon>
                                        <ListItemText primary={"Client Name : "+this.state.clientDetails.clientName} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Today />
                                        </ListItemIcon>
                                        <ListItemText primary={"Valid From : "+this.state.clientDetails.validFrom} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Today />
                                        </ListItemIcon>
                                        <ListItemText primary={"Valid To : "+this.state.clientDetails.validTo} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <ContactMail />
                                        </ListItemIcon>
                                        <ListItemText primary={"Client Pay Address : "+this.state.clientDetails.clientAddress} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Dns />
                                        </ListItemIcon>
                                        <ListItemText primary={"Check Contract Address : "+this.state.clientDetails.ccpAddress} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <AccountTree />
                                        </ListItemIcon>
                                        <ListItemText primary={"Version : 1"} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            { this.state.clientDetails.ccpStatus 
                                                ? <CheckCircle style={{ color: green[500] }} />
                                                : <Cancel style={{ color: red[500] }} />
                                            }
                                        </ListItemIcon>
                                        <ListItemText primary={"CCP Status : "+this.state.clientDetails.ccpStatusMssg} />
                                    </ListItem>
                                </List>
>>>>>>> origin/test
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                    <Grid 
                        container 
                        item 
                        xs={12}
                        justify="center"
                        alignItems="stretch"
<<<<<<< HEAD
=======
                        direction="column"
>>>>>>> origin/test
                        spacing = {2}
                    >
                        <Accordion disabled = {! this.state.domainRegistered}>
                            <AccordionSummary
                                expandIcon={<ExpandMore />}
                                aria-controls="domain-content"
                            >
                                <Typography className={classes.heading}>Domain Details</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
<<<<<<< HEAD
                                <Grid item xs={12}>
                                    <AccountCircle />
                                    <Typography>Domain Name: </Typography>
                                    <Typography>{this.state.domainDetails.domainName}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Person />
                                    <Typography>Issuer Name: </Typography>
                                    <Typography>{this.state.domainDetails.issuer}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Today />
                                    <Typography>Valid From: </Typography>
                                    <Typography>{this.state.domainDetails.validFrom}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Today />
                                    <Typography>Valid To: </Typography>
                                    <Typography>{this.state.domainDetails.validTo}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <ContactMail />
                                    <Typography>Domain Pay Address: </Typography>
                                    <Typography>{this.state.domainDetails.domainAddress}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Dns />
                                    <Typography>React Contract Address: </Typography>
                                    <Typography>{this.state.domainDetails.drpAddress}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <AttachMoney />
                                    <Typography>DRP Price: </Typography>
                                    <Typography>{this.state.domainDetails.price}{' '}Ether</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <AccountTree />
                                    <Typography>Version: </Typography>
                                    <Typography>{1}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <AttachMoney />
                                    <Typography>Escrowed Amount: </Typography>
                                    <Typography>{this.state.domainDetails.escrowAmount}{' '}Ether</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    { this.state.domainDetails.drpStatus 
                                        ? <CheckCircle style={{ color: green[500] }} />
                                        : <Cancel style={{ color: red[500] }} />

                                    }
                                    <Typography>DRP Status: </Typography>
                                    <Typography>{this.state.drpStatusMssg}</Typography>
                                </Grid>
=======
                                <List component="nav">
                                    <ListItem button>
                                        <ListItemIcon>
                                            <AccountCircle />
                                        </ListItemIcon>
                                        <ListItemText primary={"Domain Name : "+this.state.domainDetails.domainName} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Person />
                                        </ListItemIcon>
                                        <ListItemText primary={"Issuer Name : "+this.state.domainDetails.issuer} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Today />
                                        </ListItemIcon>
                                        <ListItemText primary={"Valid From : "+this.state.domainDetails.validFrom} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Today />
                                        </ListItemIcon>
                                        <ListItemText primary={"Valid To : "+this.state.domainDetails.validTo} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <ContactMail />
                                        </ListItemIcon>
                                        <ListItemText primary={"Domain Pay Address : "+this.state.domainDetails.domainAddress} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Dns />
                                        </ListItemIcon>
                                        <ListItemText primary={"React Contract Address : "+this.state.domainDetails.drpAddress} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <AttachMoney />
                                        </ListItemIcon>
                                        <ListItemText primary={"DRP Price : "+this.state.domainDetails.price+ " Ether"} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <AccountTree />
                                        </ListItemIcon>
                                        <ListItemText primary={"Version : 1"} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <AttachMoney />
                                        </ListItemIcon>
                                        <ListItemText primary={"Escrowed Amount : "+this.state.domainDetails.escrowAmount+ " Ether"} />
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemIcon>
                                            { this.state.domainDetails.drpStatus 
                                                ? <CheckCircle style={{ color: green[500] }} />
                                                : <Cancel style={{ color: red[500] }} />
                                            }
                                        </ListItemIcon>
                                        <ListItemText primary={"DRP Status : "+this.state.domainDetails.drpStatusMssg} />
                                    </ListItem>
                                </List>
>>>>>>> origin/test
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

Account.contextType = AppContext;
export default withStyles(useStyles,{ withTheme: true })(Account);
