import React, { Component } from "react";
import {
    Backdrop,
	CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
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
      fontWeight: theme.typography.fontWeightBold,
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
            ccpStatusMssg = "CCP validity has expired";
        }
        else{
            ccpStatusMssg = "CCP validity has expired and CCP Check Contract is invalid";
        }
        this.setState({
          clientDetails: {
            clientName: this.context.web3.utils.hexToUtf8(clientData[0]),
            validFrom: new Date(parseInt(clientData[1])*1000).toISOString().split("T")[0],
            validTo: new Date(parseInt(clientData[2])*1000).toISOString().split("T")[0],
            clientAddress: clientData[3],
            ccpAddress: clientData[4],
            ccpStatus: status[0] && status[1],
            ccpStatusMssg
          }
        });
    }

    async getDomainData(){
        // get escrow amount
        const escrowAmount = await this.context.contract.methods.getEscrowAmount().call({
            from: this.state.account
        });
        // get domain DRP data
        const status = await this.context.contract.methods.getDRPPStatus().call({
            from: this.state.account
        });
        const domainData = await this.context.contract.getDomainDetails().call({
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
            drpStatusMssg = "DRP validity has expired";
        }
        else{
            drpStatusMssg = "DRP validity has expired and DRP React Contract is either invalid or has been terminated";
        }
        
        this.setState({
            domainDetails: {
                domainName: this.context.web3.utils.hexToUtf8(domainData[0]),
                issuer: this.context.web3.utils.hexToUtf8(domainData[1]),
                validFrom: new Date(parseInt(domainData[2])*1000).toISOString().split("T")[0],
                validTo: new Date(parseInt(domainData[3])*1000).toISOString().split("T")[0],
                domainAddress: domainData[4],
                drpAddress: domainData[5],
                price: this.context.web3.utils.fromWei(domainData[6].toString(), "ether"),
                escrowAmount: this.context.web3.utils.fromWei(escrowAmount, "ether"),
                drpStatus: status[0] && status[1],
                drpStatusMssg
            }
        });
    }

    async getDataFromBlockchain(){
        const clientRegistered = await this.context.contract.methods.isClientRegistered().call({
            from: this.state.account
        });
        const domainRegistered = await this.context.contract.methods.isDomainRegistered().call({
            from: this.state.account
        });
        if(clientRegistered){
            await this.getClientData();
        }
        if(domainRegistered){
            await this.getDomainData();
        }
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
                    alignItems="stretch"
                    spacing = {8}
                >
                    <Grid item xs={12}>
                        <Typography variant="h5" component="h5">
                            View Your Account Details
                        </Typography>
                    </Grid>
                    <Grid 
                        container 
                        item 
                        xs={12}
                        justify="center"
                        alignItems="stretch"
                        direction="column"
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
                    </Grid>
                    <Grid 
                        container 
                        item 
                        xs={12}
                        justify="center"
                        alignItems="stretch"
                        direction="column"
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
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                    <Grid 
                        container 
                        item 
                        xs={12}
                        justify="center"
                        alignItems="stretch"
                        direction="column"
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
