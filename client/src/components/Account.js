import React, { Component } from "react";
import {
    Backdrop,
	CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Grid
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
    AccountBalanceWallet,
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
      fontWeight: theme.typography.fontWeightRegular,
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
            balance: 0,
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
            ccpStatusMssg = "CCP validity has expired";
        }
        else{
            ccpStatusMssg = "CCP validity has expired and CCP Check Contract is invalid";
        }
        this.setState({
          clientDetails: {
            clientName: this.context.web3.utils.hexToUtf8(clientName),
            validFrom: new Date(validFrom).toISOString().split("T")[0],
            validTo: new Date(validTo).toISOString().split("T")[0],
            clientAddress,
            ccpAddress: checkContract,
            ccpStatus: ccpValidityStatus && ccpContractStatus,
            ccpStatusMssg
          }
        });
    }

    async getDomainData(){
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
            drpStatusMssg = "DRP validity has expired";
        }
        else{
            drpStatusMssg = "DRP validity has expired and DRP React Contract is either invalid or has been terminated";
        }
        
        this.setState({
            domainDetails: {
                domainName: this.context.web3.utils.hexToUtf8(domainName),
                issuer: this.context.web3.utils.hexToUtf8(issuerName),
                validFrom: new Date(validFrom).toISOString().split("T")[0],
                validTo: new Date(validTo).toISOString().split("T")[0],
                domainAddress,
                drpAddress: reactContract,
                price: parseFloat(this.context.web3.utils.fromWei(drpPrice, "ether")),
                escrowAmount: parseFloat(this.context.web3.utils.fromWei(escrowAmount, "ether")),
                drpStatus: drpValidityStatus && drpContractStatus,
                drpStatusMssg
            }
        });
    }

    async getDataFromBlockchain(){
        await this.getBalance();
        const clientRegistered = await this.context.contract.methods.isClientRegistered().call();
        const domainRegistered = await this.context.contract.methods.isDomainRegistered().call();
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
                    justify="center"
                    alignItems="center"
                    spacing = {8}
                >
                    <Grid 
                        container 
                        item 
                        xs={12}
                        justify="center"
                        alignItems="stretch"
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
                    </Grid>
                    <Grid 
                        container 
                        item 
                        xs={12}
                        justify="center"
                        alignItems="stretch"
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
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                    <Grid 
                        container 
                        item 
                        xs={12}
                        justify="center"
                        alignItems="stretch"
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
