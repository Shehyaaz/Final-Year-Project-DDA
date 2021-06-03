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
    Typography
} from "@material-ui/core";
import {
    PersonAdd,
    DoneOutline,
    MonetizationOn,
    DeleteForever,
    VerifiedUserOutlined,
    DeleteOutline
} from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import DRPRegistration from "./DRPRegistration";
import AppContext from "../context/AppContext";

const useStyles = theme => ({
    root: {
        display: "flex",
    },
    cardButton: {
        marginLeft: "auto",
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


class DomainDashboard extends Component {
    constructor(props){
		super(props);
        this.state={
            account: '',
            isLoading: false,
            isRegistered: false,
            openRegistrationForm: false
        }
		this.handleRegisterDRP = this.handleRegisterDRP.bind(this);
        this.getDomainRegistrationStatus = this.getDomainRegistrationStatus.bind(this); 
        this.checkDRPStatus = this.checkDRPStatus.bind(this);
        this.getEscrowAmount = this.getEscrowAmount.bind(this);
        this.expireDRP = this.expireDRP.bind(this);   
	}

    async getDomainRegistrationStatus(){
        const isRegistered = await this.context.contract.methods.isDomainRegistered().call();
        this.setState({
            isRegistered
        });
    }

    async handleRegisterDRP(domainDetails){
        this.setState({
            isLoading: true,
            openRegistrationForm: false
        });
        if(this.state.isRegistered){
            // get update fee from blockchain
            const updateFee = await this.context.contract.domain_update_fee;
            // update domain details
            try{
                this.context.contract.methods.updateDomain(
                    this.context.web3.utils.utf8ToHex(domainDetails.issuer),
                    Math.floor(new Date(domainDetails.validTo).getTime()/1000),
                    parseInt(this.context.web3.utils.toWei(domainDetails.price, "ether")),
                    domainDetails.drpAddress
                ).send({
                    from: this.state.account,
                    value: updateFee
                })
                .on("receipt", () => {
                    alert(domainDetails.domainName+" details updated successfully !");
                    this.setState({
                        isLoading: false
                    });
                })
                .on("error", () => {
                    alert(domainDetails.domainName+" updation failed !");
                    this.setState({
                        isLoading: false
                    });
                });
            }catch(err){
                alert(domainDetails.domainName+" updation failed !");
                this.setState({
                    isLoading: false
                });
            }
        }
        else{
            // get rregistration fee from blockchain
            const registerFee = await this.context.contract.domain_registration_fee;
            // check if domain is available on the Internet
            fetch("/verify?domainName="+domainDetails.domainName)
            .then((res) => {
                if(res.ok){
                    // register domain details
                    try{
                        this.context.contract.methods.registerDomain(
                            this.context.web3.utils.utf8ToHex(domainDetails.domainName),
                            this.context.web3.utils.utf8ToHex(domainDetails.issuer),
                            Math.floor(new Date(domainDetails.validFrom).getTime()/1000),
                            Math.floor(new Date(domainDetails.validTo).getTime()/1000),
                            parseInt(this.context.web3.utils.toWei(domainDetails.price, "ether")),
                            domainDetails.drpAddress,
                            domainDetails.version
                        ).send({
                            from: this.state.account,
                            value: registerFee
                        })
                        .on("receipt", () => {
                            alert(domainDetails.domainName+" registered successfully !");
                            this.setState({
                                isLoading: false
                            });
                        })
                        .on("error", () => {
                            alert(domainDetails.domainName+" registration failed !");
                            this.setState({
                                isLoading: false
                            });
                        });
                    }catch(err){
                        alert(domainDetails.domainName+" registration failed !");
                        this.setState({
                            isLoading: false
                        }); 
                    }
                }
                else{
                    alert(domainDetails.domainName+" was not found on the Internet !");
                    this.setState({
                        isLoading: false
                    });
                }
            })
            .catch((err) => {
                alert("An error occurred: "+err);
                this.setState({
                    isLoading: false
                });
            });
        }
    }

    async checkDRPStatus(){
        this.setState({
            isLoading: true
        });
        const [drpValidityStatus, drpContractStatus] = await this.context.contract.methods.getDRPPStatus().call();
        if(drpValidityStatus && drpContractStatus){
            alert("DRP valid :)");
        }
        else if(drpValidityStatus && !drpContractStatus){
            alert("DRP React Contract is either invalid or has been terminated :(");
        }
        else if(!drpValidityStatus && drpContractStatus){
            alert("DRP validity has expired :(");
        }
        else{
            alert("DRP validity has expired and DRP React Contract is either invalid or has been terminated :(");
        }
        this.setState({
            isLoading: false
        });
    }

    async getEscrowAmount(){
        this.setState({
            isLoading: true
        });
        const escrowAmount = await this.context.contract.methods.getEscrowAmount().call();
        alert("Your escrowed amount is :"+parseFloat(this.context.web3.utils.fromWei(escrowAmount, "ether")));
        this.setState({
            isLoading: false
        });
    }

    async expireDRP(){
        this.setState({
            isLoading: true
        });
        if(window.confirm("Expiring the DRP will delete your DRP from the blockchain, do you wish to continue")){
            try{
                await this.context.contract.methods.expireDRP().send({
                    from: this.state.account
                })
                .on("receipt", async(receipt) => {
                    if(receipt.events.DRPExpired && receipt.events.DRPExpired.returnValues._domainAddr){
                        alert("DRP expired successfully");
                        await this.getDomainRegistrationStatus();
                        this.setState({
                            isLoading: false
                        });
                    }
                    else{
                        alert("Failed to expire DRP :(");
                        this.setState({
                            isLoading: false
                        });
                    }
                })
                .on("error", () => {
                    alert("An error has occurred, failed to expire DRP :(");
                    this.setState({
                        isLoading: false
                    });
                });
            }
            catch(err){
                alert("An error occurred "+err);
                this.setState({
                    isLoading: false
                });
            }
        }
    }

    componentDidMount(){
        this.setState({
            account: this.context.account,
            isLoading: true
        });
        this.getDomainRegistrationStatus().then(() => {
            this.setState({
                isLoading: false
            });
        });        
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.account !== this.context.account){
            this.setState({
                account: this.context.account
            });
            this.getDomainRegistrationStatus().then(() => {
                this.setState({
                    isLoading: false
                });
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
                                    <Avatar aria-label="register drp" className={classes.avatar}>
                                        <PersonAdd/>
                                    </Avatar>
                                    }
                                    title="Register"
                                />
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        To register/update in the system, the user(domain) must specify a Domain Reaction Policy
                                        or DRP
                                    </Typography>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Button color="primary"
                                        startIcon={<PersonAdd/>}
                                        onClick={() => this.setState({openRegistrationForm:true})}
                                        disableElevation
                                        size="small"
                                        className={classes.cardButton}    
                                    >
                                        { this.state.isRegistered 
                                        ? "Update DRP"
                                        : "Register DRP"}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} >
                            <Card>
                                <CardHeader
                                    avatar={
                                    <Avatar aria-label="drp-status" className={classes.avatar}>
                                        <DoneOutline />
                                    </Avatar>
                                    }
                                    title="DRP Status"
                                />
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        Check the status of your DRP.
                                    </Typography>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Button color="primary"
                                        startIcon={<VerifiedUserOutlined />}
                                        onClick={this.checkDRPStatus}
                                        disableElevation
                                        disabled={!this.state.isRegistered}
                                        size="small" 
                                        className={classes.cardButton}   
                                    >
                                       Check DRP Status
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </Grid>
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
                                    <Avatar aria-label="get-escrow-amount" className={classes.avatar}>
                                        <MonetizationOn />
                                    </Avatar>
                                    }
                                    title="Escrowed Amount"
                                />
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        View the amount escrowed by the system.
                                    </Typography>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Button color="primary"
                                        startIcon={<MonetizationOn />}
                                        onClick={this.getEscrowAmount}
                                        disableElevation
                                        disabled={!this.state.isRegistered}
                                        size="small"
                                        className={classes.cardButton}    
                                    >
                                        View escrowed amount
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} >
                            <Card>
                                <CardHeader
                                    avatar={
                                    <Avatar aria-label="expire-drp" className={classes.avatar}>
                                        <DeleteForever />
                                    </Avatar>
                                    }
                                    title="Expire DRP"
                                />
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        Expire your DRP, this will delete your DRP from the system and transfer
                                        the escrowed amount to you
                                    </Typography>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Button color="primary"
                                        startIcon={<DeleteOutline />}
                                        onClick={this.expireDRP}
                                        disableElevation
                                        disabled={!this.state.isRegistered}
                                        size="small" 
                                        className={classes.cardButton}   
                                    >
                                       Expire DRP
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
                <DRPRegistration 
                    open={this.state.openRegistrationForm}
                    onClose={() => this.setState({openRegistrationForm: false})}
                    update={this.state.isRegistered}
                    onRegister={(domainDetails) => this.handleRegisterDRP(domainDetails)}
                />
            </div>
        );
    }
}

DomainDashboard.contextType = AppContext;
export default withStyles(useStyles,{ withTheme: true })(DomainDashboard);
