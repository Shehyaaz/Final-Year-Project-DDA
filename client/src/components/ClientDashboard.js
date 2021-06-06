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
import AlertDialog from "../widgets/AlertDialog";
import AppContext from "../context/AppContext";
import { gasLimit } from "../utils/constants";
import { 
    green,
    red 
} from '@material-ui/core/colors';

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

class ClientDashboard extends Component {
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
            deleteDRPIndex: "",
            isLoading: false,
            isRegistered: false,
            openRegistrationForm: false,
            openPurchaseForm: false,
            drpList: []
        }
		this.handleRegisterCCP = this.handleRegisterCCP.bind(this);
        this.handlePurchaseDRP = this.handlePurchaseDRP.bind(this);
        this.handleDRPCheck = this.handleDRPCheck.bind(this);
        this.getClientData = this.getClientData.bind(this);
        this.checkCCPStatus = this.checkCCPStatus.bind(this);
        this.deleteDRP = this.deleteDRP.bind(this);
	}

    DataRow = row => (
        <TableRow key={row.drpIndex}>
          <TableCell>{row.domainName}</TableCell>
          <TableCell>{row.validFrom}</TableCell>
          <TableCell>{row.validTo}</TableCell>
          <TableCell>{row.drpPrice}</TableCell>
          <TableCell>{row.lastChecked}</TableCell>
          <TableCell>
              <Button size="small" endIcon={<VerifiedUserOutlined/>}
                style={{color: row.lastChecked === "-" ? red[500] : green[500]}}
                disableElevation
                onClick= {() => this.handleDRPCheck(row.domainName, row.drpIndex)}
              >
                  Check
              </Button>
          </TableCell>
        </TableRow>
    );

    async handleDRPCheck(domainName, drpIndex){
        this.setState({
            isLoading: true
        });
        fetch("/getsct?domainName="+domainName)
        .then((res) => {
            if(res.ok){
                return res.json();
            }
            throw new Error(res);
        })
        .then(async(res) => {
            // call check certificate function from contract
            let sctLogID = [];
            let sctTimestamp = [];
            if(res.sctList.length > 0){
                sctLogID = res.sctList.map(sct => sct.logID);
                sctTimestamp = res.sctList.map(sct => sct.timestamp);
            }

            await this.context.contract.methods.checkCertificate(
                drpIndex,
                sctLogID,
                sctTimestamp,
                res.certValidFrom,
                res.certValidTo,
                res.ocspRes
            ).send({
                from: this.state.account,
                gas: gasLimit
            })
            .on("receipt", async(receipt) => {
                // certificate check was executed
                if(receipt.events.CertChecked && receipt.events.CertChecked.returnValues._certValid){
                    await this.getClientData();
                    this.setState({
                        alert: {
                            open: true,
                            title: "Valid",
                            message: domainName+" certificate is Valid"
                        },
                        isLoading: false
                    });
                }
                else{
                    await this.getClientData();
                    this.setState({
                        alert: {
                            open: true,
                            title: "Invalid",
                            message: domainName+" has an INVALID certificate !"
                        },
                        isLoading: false
                    });
                }
            })
            .on("error", (err) => {
                console.log(err);
                // certificate check was not executed
                this.setState({
                    alert: {
                        open: true,
                        title: "Delete DRP",
                        message: "Please check CCP and purchased DRP validity. If CCP valid, this DRP has been terminated. Delete this DRP ?"
                    },
                    showConfirm: true,
                    deleteDRPIndex: drpIndex,
                    isLoading: false
                });
            });
        })
        .catch((err) => {
            this.setState({
                alert: {
                    open: true,
                    title: "Error",
                    message: "An error has occurred :("+err.message
                },
                isLoading: false
            });
        });
    }
    
    async deleteDRP(drpIndex){
        this.setState({
            isLoading: true,
            showConfirm: false,
            alert: {
                open: false,
                title: "",
                message: ""
            }
        });
        // delete DRP from client DRP list
        await this.context.contract.methods.deleteDRPFromClientList(this.state.account, drpIndex).send({
            from: this.state.account,
            gas: gasLimit
        })
        .on("receipt", async(receipt) => {
            if(receipt.events.DRPDeleted && receipt.events.DRPDeleted.returnValues._domainAddr){
                await this.getClientData();
                this.setState({
                    alert: {
                        open: true,
                        title: "Success",
                        message: "DRP deleted successfully"
                    },
                    isLoading: false,
                    deleteDRPIndex: ""
                });
            }
            else {
                this.setState({
                    alert: {
                        open: true,
                        title: "Error",
                        message: "Could not delete DRP :("
                    },
                    isLoading: false
                });
            }
        })
        .on("error", ()=>{
            this.setState({
                alert: {
                    open: true,
                    title: "Error",
                    message: "An error has occurred :("
                },
                isLoading: false
            });
        });
    }

    async handleRegisterCCP(clientDetails){
        this.setState({
            isLoading: true,
            openRegistrationForm: false
        });
        if(this.state.isRegistered){
            // get update fee from blockchain
            const updateFee = await this.context.contract.methods.update_fee().call();
            // update client details
            try{
                this.context.contract.methods.updateClient(
                    Math.floor(new Date(clientDetails.validTo).getTime()/1000),
                    clientDetails.ccpAddress
                ).send({
                    from: this.state.account,
                    value: updateFee,
                    gas: gasLimit
                })
                .on("receipt", async() => {
                    await this.getClientData();
                    this.setState({
                        alert: {
                            open: true,
                            title: "Success",
                            message: clientDetails.clientName+" details were updated successfully !",
                        },
                        isLoading: false
                    });
                })
                .on("error", () => {
                    this.setState({
                        alert: {
                            open: true,
                            title: "Error",
                            message: clientDetails.clientName+" details could not be updated !"
                        },
                        isLoading: false
                    });
                });
            }catch(err){
                this.setState({
                    alert: {
                        open: true,
                        title: "Error",
                        message: clientDetails.clientName+" details could not be updated ! "+err.message
                    },
                    isLoading: false
                });
            }
        }
        else{
            // get registration fee from blockchain
            const registerFee = await this.context.contract.methods.client_registration_fee().call();
            // register client details
            try{
                await this.context.contract.methods.registerClient(
                    this.context.web3.utils.utf8ToHex(clientDetails.clientName),
                    Math.floor(new Date(clientDetails.validFrom).getTime()/1000),
                    Math.floor(new Date(clientDetails.validTo).getTime()/1000),
                    clientDetails.ccpAddress,
                    clientDetails.version
                ).send({
                    from: this.state.account,
                    value: registerFee,
                    gas: gasLimit
                })
                .on("receipt", async() => {
                    await this.getClientData();
                    this.setState({
                        alert: {
                            open: true,
                            title: "Success",
                            message: clientDetails.clientName+" registered successfully !"
                        },
                        isLoading: false
                    });
                })
                .on("error", () => {
                    this.setState({
                        alert: {
                            open: true,
                            title: "Error",
                            message: clientDetails.clientName+" registration failed !"
                        },
                        isLoading: false
                    });
                });
            }catch(err){
                this.setState({
                    alert: {
                        open: true,
                        title: "Error",
                        message: clientDetails.clientName+" registration failed ! "+err.message
                    },
                    isLoading: false
                }); 
            }
        }
    }

    async handlePurchaseDRP(domain){
        this.setState({
            isLoading: true,
            openPurchaseForm: false
        });
        try{
            await this.context.contract.methods.purchaseDRP(domain.domainAddress).send({
                from: this.state.account,
                value: this.context.web3.utils.toWei(domain.drpPrice, "ether"),
                gas: gasLimit
            })
            .on("receipt", async() => {
                await this.getClientData();
                this.setState({
                    alert: {
                        open: true,
                        title: "Success",
                        message: "Successfully purchased the DRP of "+domain.domainName
                    },
                    isLoading: false
                });
            })
            .on("error", () => {
                this.setState({
                    alert: {
                        open: true,
                        title: "Error",
                        message: "DRP purchase failed :("
                    },
                    isLoading: false
                });
            });
        }catch(err){
            this.setState({
                alert: {
                    open: true,
                    title: "Error",
                    message: "DRP purchase failed :( "+err.message
                },
                isLoading: false
            }); 
        }
    }

    async checkCCPStatus(){
        this.setState({
            isLoading: true
        });
        const status = await this.context.contract.methods.getCCPStatus().call({
            from: this.state.account
        });
        let mssg = "";
        let title = "";
        if(status[0] && status[1]){
            title = "Valid";
            mssg = "Your Client Check Policy is valid :)";
        }
        else if(status[0] && !status[1]){
            title = "Invalid";
            mssg = "Your Client Check Policy Check Contract is invalid :(";
        }
        else if(!status[0] && status[1]){
            title = "Invalid";
            mssg = "The validity of your Client Check Policy has expired :(";
        }
        else{
            title = "Invalid";
            mssg = "The validity of your Client Check Policy has expired and the Check Contract is invalid :(";
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

    async getClientData(){
        const isRegistered = await this.context.contract.methods.isClientRegistered().call({
            from: this.state.account
        });
        const drpList = [];
        if(isRegistered){
            const drpListLength = await this.context.contract.methods.getClientDRPListLength().call({
                from: this.state.account
            });
            for(let i = parseInt(drpListLength) - 1; i >= 0; i--){
                const drpData = await this.context.contract.methods.getClientDRPList(i).call({
                    from: this.state.account
                }); // an array of values is returned
                drpList.push({
                    drpIndex: i,
                    domainName: this.context.web3.utils.hexToUtf8(drpData[0]),
                    validFrom: new Date(parseInt(drpData[1])*1000).toISOString().split("T")[0],
                    validTo: new Date(parseInt(drpData[2])*1000).toISOString().split("T")[0],
                    drpPrice: this.context.web3.utils.fromWei(drpData[3], "ether"),
                    lastChecked: parseInt(drpData[4]) > 0 ? new Date(parseInt(drpData[4])*1000).toISOString().split("T")[0] : "-"
                });
            }
        }
        this.setState({
            isRegistered,
            drpList
        });
    }

    componentDidMount = async() => {
        this.setState({
            account: this.context.account,
            isLoading: true
        });
        await this.getClientData();
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
            await this.getClientData();
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
                                    title={this.state.isRegistered ? "Update/Check CCP Status" : "Register/Check CCP Status"}
                                />
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        To register/update in the system, the user(client) must specify a Client Check Policy
                                        or CCP.
                                    </Typography>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <Button color="primary"
                                        startIcon={<VerifiedUserOutlined />}
                                        onClick={this.checkCCPStatus}
                                        disableElevation
                                        disabled={!this.state.isRegistered}
                                        size="small" 
                                        className={classes.cardButton}   
                                    >
                                       Check CCP Status
                                    </Button>
                                    <Button color="primary"
                                        startIcon={<PersonAdd />}
                                        onClick={() => this.setState({openRegistrationForm: true})}
                                        disableElevation
                                        size="small" 
                                        className={classes.cardButton}   
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
                                        className={classes.cardButton} 
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
                                        <TableCell>DRP Valid From</TableCell>
                                        <TableCell>DRP Valid To</TableCell>
                                        <TableCell>DRP Price(in ether)</TableCell>
                                        <TableCell>Last Checked</TableCell>
                                        <TableCell>Action</TableCell>                                        
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(this.state.drpList.length === 0)
                                    ? <TableRow>
                                        <TableCell align="center" colSpan="6">
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
                    onRegister={(clientDetails) => this.handleRegisterCCP(clientDetails)}
                /> 

                <PurchaseDRP 
                    open={this.state.openPurchaseForm} 
                    onClose={() => this.setState({openPurchaseForm: false})}
                    onPurchase={(domain) => this.handlePurchaseDRP(domain)}
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
                        ?   () => this.deleteDRP(this.state.deleteDRPIndex)
                        :   undefined
                    }
                />
            </div>
        );
    }
}

ClientDashboard.contextType = AppContext;
export default withStyles(useStyles,{ withTheme: true })(ClientDashboard);
