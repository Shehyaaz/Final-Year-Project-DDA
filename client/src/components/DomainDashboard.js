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
import AlertDialog from "../widgets/AlertDialog";
import AppContext from "../context/AppContext";
import { gasLimit } from "../utils/constants";

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
            alert: {
                open: false,
                title: '',
                message: ''
            },
            showConfirm: false,
            isLoading: false,
            isRegistered: false,
            openRegistrationForm: false
        }
		this.handleRegisterDRP = this.handleRegisterDRP.bind(this);
        this.checkDRPStatus = this.checkDRPStatus.bind(this);
        this.getEscrowAmount = this.getEscrowAmount.bind(this);
        this.expireDRP = this.expireDRP.bind(this);   
	}

    async handleRegisterDRP(domainDetails){
        this.setState({
            isLoading: true,
            openRegistrationForm: false
        });
        if(this.state.isRegistered){
            // get update fee from blockchain
            const updateFee = await this.context.contract.methods.domain_update_fee().call();
            // update domain details
            try{
                await this.context.contract.methods.updateDomain(
                    this.context.web3.utils.utf8ToHex(domainDetails.issuer),
                    Math.floor(new Date(domainDetails.validTo).getTime()/1000),
                    this.context.web3.utils.toWei(domainDetails.price, "ether"),
                    domainDetails.drpAddress
                ).send({
                    from: this.state.account,
                    value: updateFee,
                    gas: gasLimit
                })
                .on("receipt", () => {
                    this.setState({
                        alert: {
                            open: true,
                            title: "Success",
                            message: domainDetails.domainName+" details were updated successfully !"
                        },
                        isLoading: false
                    });
                })
                .on("error", () => {
                    this.setState({
                        alert: {
                            open: true,
                            title: "Error",
                            message: domainDetails.domainName+" updation failed !"
                        },
                        isLoading: false
                    });
                });
            }catch(err){
                this.setState({
                    alert: {
                        open: true,
                        title: "Error",
                        message: domainDetails.domainName+" updation failed !\n"+err.message
                    },
                    isLoading: false
                });
            }
        }
        else{
            // get rregistration fee from blockchain
            const registerFee = await this.context.contract.methods.domain_registration_fee().call();
            // check if domain is available on the Internet
            fetch("/verify?domainName="+domainDetails.domainName)
            .then(async(res) => {
                if(res.ok){
                    // register domain details
                    try{
                        await this.context.contract.methods.registerDomain(
                            this.context.web3.utils.utf8ToHex(domainDetails.domainName),
                            this.context.web3.utils.utf8ToHex(domainDetails.issuer),
                            Math.floor(new Date(domainDetails.validFrom).getTime()/1000),
                            Math.floor(new Date(domainDetails.validTo).getTime()/1000),
                            this.context.web3.utils.toWei(domainDetails.price, "ether"),
                            domainDetails.drpAddress,
                            domainDetails.version
                        ).send({
                            from: this.state.account,
                            value: registerFee,
                            gas: gasLimit
                        })
                        .on("receipt", () => {
                            this.setState({
                                alert: {
                                    open: true,
                                    title: "Success",
                                    message: domainDetails.domainName+" registered successfully !"
                                },
                                isRegistered: true,
                                isLoading: false
                            });
                        })
                        .on("error", () => {
                            this.setState({
                                alert: {
                                    open: true,
                                    title: "Error",
                                    message: domainDetails.domainName+" registration failed !"
                                },
                                isLoading: false
                            });
                        });
                    }catch(err){
                        this.setState({
                            alert: {
                                open: true,
                                title: "Error",
                                message: domainDetails.domainName+" registration failed !\n"+err.message
                            },
                            isLoading: false
                        }); 
                    }
                }
                else{
                    this.setState({
                        alert: {
                            open: true,
                            title: "Error",
                            message: domainDetails.domainName+" was not found on the Internet !"
                        },
                        isLoading: false
                    });
                }
            })
            .catch((err) => {
                this.setState({
                    alert: {
                        open: true,
                        title: "Error",
                        message: "An error occurred: "+err.message
                    },
                    isLoading: false
                });
            });
        }
    }

    async checkDRPStatus(){
        this.setState({
            isLoading: true
        });
        const status = await this.context.contract.methods.getDRPStatus().call({
            from: this.state.account
        });
        let title = "";
        let mssg = "";
        if(status[0] && status[1]){
            title = "Valid";
            mssg = "Your Domain Reaction Policy is valid :)";
        }
        else if(status[0] && !status[1]){
            title = "Invalid";
            mssg = "DRP React Contract is either invalid or has been terminated :(";
        }
        else if(!status[0] && status[1]){
            title = "Invalid";
            mssg = "The validity of your Domain Reaction Policy has expired :(";
        }
        else{
            title = "Invalid";
            mssg = "The validity of your Domain Reaction Policy has expired and the React Contract is either invalid or has been terminated :(";
        }
        this.setState({
            alert: {
                open: true,
                title,
                message: mssg
            },
            isLoading: false
        });
    }

    async getEscrowAmount(){
        this.setState({
            isLoading: true
        });
        const escrowAmount = await this.context.contract.methods.getEscrowAmount().call({
            from: this.state.account
        });
        this.setState({
            alert: {
                open: true,
                title: "Escrow Amount",
                message: "Your escrowed amount is :"+parseFloat(this.context.web3.utils.fromWei(escrowAmount, "ether"))+" ether"
            },
            isLoading: false
        });
    }

    async expireDRP(){
        this.setState({
            isLoading: true,
            showConfirm: false,
            alert: {
                open: false,
                title: "",
                message: ""
            }
        });
        try{
            await this.context.contract.methods.expireDRP().send({
                from: this.state.account,
                gas: gasLimit
            })
            .on("receipt", (receipt) => {
                if(receipt.events.DRPExpired && receipt.events.DRPExpired.returnValues._domainAddr){
                    this.setState({
                        alert: {
                            open: true,
                            title: "Success",
                            message: "DRP expired successfully !"
                        },
                        isRegistered: false,
                        isLoading: false
                    });
                }
                else{
                    this.setState({
                        alert: {
                            open: true,
                            title: "Error",
                            message: "Failed to expire DRP :("
                        },
                        isLoading: false
                    });
                }
            })
            .on("error", () => 
                    this.setState({
                        alert: {
                            open: true,
                            title: "Error",
                            message: "An error has occurred, failed to expire DRP :("
                        },
                        isLoading: false
                    })
                );
        }
        catch(err){
            this.setState({
                alert: {
                    open: true,
                    title: "Error",
                    message: "An error occurred "+err.message
                },
                isLoading: false
            });
        }
    }

    componentDidMount = async() => {
        this.setState({
            account: this.context.account,
            isLoading: true
        });
        const isRegistered = await this.context.contract.methods.isDomainRegistered().call({
            from: this.state.account
        });
        this.setState({
            isLoading: false,
            isRegistered
        });
    }

    componentDidUpdate = async(prevProps, prevState) => {
        if(prevState.account !== this.context.account){
            this.setState({
                account: this.context.account,
                isLoading: true
            });
            const isRegistered = await this.context.contract.methods.isDomainRegistered().call({
                from: this.state.account
            });
            this.setState({
                isLoading: false,
                isRegistered
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
                                        disableElevation
                                        disabled={!this.state.isRegistered}
                                        size="small" 
                                        className={classes.cardButton}  
                                        onClick={() => this.setState({
                                                        showConfirm: true,
                                                        alert: {
                                                            open: true,
                                                            title: "Expire DRP",
                                                            message: "Expiring the DRP will delete your DRP from the blockchain, do you wish to continue ?"
                                                        }
                                                    })
                                                } 
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
                    onRegister={(domainDetails) => this.handleRegisterDRP(domainDetails)}
                />

                <AlertDialog 
                    open={this.state.alert.open}
                    title={this.state.alert.title}
                    message={this.state.alert.message}
                    isConfirm={this.state.showConfirm}
                    onClose={() => this.setState({
                        alert: {
                            open: false,
                            title: "",
                            message: ""
                        },
                        showConfirm: false
                    })}
                    onConfirm={this.state.showConfirm 
                        ?   () => this.expireDRP()
                        :   undefined
                    }
                />
            </div>
        );
    }
}

DomainDashboard.contextType = AppContext;
export default withStyles(useStyles,{ withTheme: true })(DomainDashboard);
