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
<<<<<<< HEAD
import { red } from "@material-ui/core/colors";
import CCPRegistration from "./CCPRegistration";
import PurchaseDRP from "./PurchaseDRP";
import AppContext from "../context/AppContext";
=======
import CCPRegistration from "./CCPRegistration";
import PurchaseDRP from "./PurchaseDRP";
import AlertDialog from "../widgets/AlertDialog";
import AppContext from "../context/AppContext";
import { gasLimit } from "../utils/constants";
import { 
    green,
    red 
} from '@material-ui/core/colors';
>>>>>>> origin/test

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
<<<<<<< HEAD
=======
            alert: {
                open: false,
                title: '',
                message: ''
            },
            showConfirm: false,
            deleteDRPIndex: "",
>>>>>>> origin/test
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
<<<<<<< HEAD
=======
        this.deleteDRP = this.deleteDRP.bind(this);
>>>>>>> origin/test
	}

    DataRow = row => (
        <TableRow key={row.drpIndex}>
          <TableCell>{row.domainName}</TableCell>
          <TableCell>{row.validFrom}</TableCell>
          <TableCell>{row.validTo}</TableCell>
          <TableCell>{row.drpPrice}</TableCell>
          <TableCell>{row.lastChecked}</TableCell>
          <TableCell>
<<<<<<< HEAD
              <Button color="secondary" size="small" endIcon={<VerifiedUserOutlined/>}
=======
              <Button size="small" endIcon={<VerifiedUserOutlined/>}
                style={{color: row.lastChecked === "-" ? red[500] : green[500]}}
>>>>>>> origin/test
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
<<<<<<< HEAD
        .then((res) => {
            // call check certificate function from contract
            const sctLogID = res.sctList.map(sct => sct.logID);
            const sctTimestamp = res.sctList.map(sct => sct.timestamp);
            this.context.contract.checkCertificate(
=======
        .then(async(res) => {
            // call check certificate function from contract
            let sctLogID = [];
            let sctTimestamp = [];
            if(res.sctList.length > 0){
                sctLogID = res.sctList.map(sct => sct.logID);
                sctTimestamp = res.sctList.map(sct => sct.timestamp);
            }

            await this.context.contract.methods.checkCertificate(
>>>>>>> origin/test
                drpIndex,
                sctLogID,
                sctTimestamp,
                res.certValidFrom,
<<<<<<< HEAD
                res.certValidTo
            ).send({
                from: this.state.account
=======
                res.certValidTo,
                res.ocspRes
            ).send({
                from: this.context.account,
                gas: gasLimit
>>>>>>> origin/test
            })
            .on("receipt", async(receipt) => {
                // certificate check was executed
                if(receipt.events.CertChecked && receipt.events.CertChecked.returnValues._certValid){
<<<<<<< HEAD
                    alert(domainName+" certificate is Valid");
                    this.setState({
=======
                    await this.getClientData();
                    this.setState({
                        alert: {
                            open: true,
                            title: "Valid",
                            message: domainName+" certificate is Valid"
                        },
>>>>>>> origin/test
                        isLoading: false
                    });
                }
                else{
<<<<<<< HEAD
                    alert(domainName+" has an INVALID certificate !");
                    await this.getClientData();
                    this.setState({
=======
                    await this.getClientData();
                    this.setState({
                        alert: {
                            open: true,
                            title: "Invalid",
                            message: domainName+" has an INVALID certificate !"
                        },
>>>>>>> origin/test
                        isLoading: false
                    });
                }
            })
<<<<<<< HEAD
            .on("error", () => {
                // certificate check was not executed
                if(window.confirm("Please check CCP and purchased DRP validity. If found valid, this DRP has been terminated. Delete this DRP ?")){
                    this.context.contract.deleteDRPFromClientList(drpIndex).send({
                        from: this.state.account
                    })
                    .on("receipt", (receipt) => {
                        if(receipt.events.DRPDeleted && receipt.events.DRPDeleted.returnValues._domainAddr){
                            alert(domainName+" DRP deleted successfully");
                            this.setState({
                                isLoading: false
                            });
                        }
                        else {
                            alert("Could not delete DRP :(");
                            this.setState({
                                isLoading: false
                            });
                        }
                    })
                    .on("error", ()=>{
                        alert("An error has occurred :(");
                        this.setState({
                            isLoading: false
                        });
                    });
                }
            });
        })
        .catch((err) => {
            alert("An error occurred: "+err);
            this.setState({
=======
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
>>>>>>> origin/test
                isLoading: false
            });
        });
    }
    
<<<<<<< HEAD
=======
    async deleteDRP(drpIndex){
        const alert = this.state.alert;
        this.setState({
            isLoading: true,
            showConfirm: false,
            alert: {
                ...alert,
                open: false
            }
        });
        // delete DRP from client DRP list
        await this.context.contract.methods.deleteDRPFromClientList(this.context.account, drpIndex).send({
            from: this.context.account,
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

>>>>>>> origin/test
    async handleRegisterCCP(clientDetails){
        this.setState({
            isLoading: true,
            openRegistrationForm: false
        });
        if(this.state.isRegistered){
            // get update fee from blockchain
<<<<<<< HEAD
            const updateFee = await this.context.contract.client_update_fee;
=======
            const updateFee = await this.context.contract.methods.update_fee().call();
>>>>>>> origin/test
            // update client details
            try{
                this.context.contract.methods.updateClient(
                    Math.floor(new Date(clientDetails.validTo).getTime()/1000),
                    clientDetails.ccpAddress
                ).send({
<<<<<<< HEAD
                    from: this.state.account,
                    value: updateFee
                })
                .on("receipt", () => {
                    alert(clientDetails.clientName+" details updated successfully !");
                    this.setState({
=======
                    from: this.context.account,
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
>>>>>>> origin/test
                        isLoading: false
                    });
                })
                .on("error", () => {
<<<<<<< HEAD
                    alert(clientDetails.clientName+" updation failed !");
                    this.setState({
=======
                    this.setState({
                        alert: {
                            open: true,
                            title: "Error",
                            message: clientDetails.clientName+" details could not be updated !"
                        },
>>>>>>> origin/test
                        isLoading: false
                    });
                });
            }catch(err){
<<<<<<< HEAD
                alert(clientDetails.clientName+" updation failed !");
                this.setState({
=======
                this.setState({
                    alert: {
                        open: true,
                        title: "Error",
                        message: clientDetails.clientName+" details could not be updated ! "+err.message
                    },
>>>>>>> origin/test
                    isLoading: false
                });
            }
        }
        else{
            // get registration fee from blockchain
<<<<<<< HEAD
            const registerFee = await this.context.contract.client_registration_fee;
            // register client details
            try{
                this.context.contract.methods.registerClient(
=======
            const registerFee = await this.context.contract.methods.client_registration_fee().call();
            // register client details
            try{
                await this.context.contract.methods.registerClient(
>>>>>>> origin/test
                    this.context.web3.utils.utf8ToHex(clientDetails.clientName),
                    Math.floor(new Date(clientDetails.validFrom).getTime()/1000),
                    Math.floor(new Date(clientDetails.validTo).getTime()/1000),
                    clientDetails.ccpAddress,
                    clientDetails.version
                ).send({
<<<<<<< HEAD
                    from: this.state.account,
                    value: registerFee
                })
                .on("receipt", () => {
                    alert(clientDetails.clientName+" registered successfully !");
                    this.setState({
=======
                    from: this.context.account,
                    value: registerFee,
                    gas: gasLimit*3
                })
                .on("receipt", async() => {
                    await this.getClientData();
                    this.setState({
                        alert: {
                            open: true,
                            title: "Success",
                            message: clientDetails.clientName+" registered successfully !"
                        },
>>>>>>> origin/test
                        isLoading: false
                    });
                })
                .on("error", () => {
<<<<<<< HEAD
                    alert(clientDetails.clientName+" registration failed !");
                    this.setState({
=======
                    this.setState({
                        alert: {
                            open: true,
                            title: "Error",
                            message: clientDetails.clientName+" registration failed ! Please check your Check contract address !"
                        },
>>>>>>> origin/test
                        isLoading: false
                    });
                });
            }catch(err){
<<<<<<< HEAD
                alert(clientDetails.clientName+" registration failed !");
                this.setState({
=======
                this.setState({
                    alert: {
                        open: true,
                        title: "Error",
                        message: clientDetails.clientName+" registration failed ! "+err.message
                    },
>>>>>>> origin/test
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
<<<<<<< HEAD
            this.context.contract.methods.purchaseDRP(domain.domainAddress).send({
                from: this.state.account,
                value: parseInt(this.context.web3.utils.toWei(domain.drpPrice, "ether"))
            })
            .on("receipt", () => {
                alert("Successfully purchased "+domain.domainName+" DRP");
                this.setState({
=======
            await this.context.contract.methods.purchaseDRP(domain.domainAddress).send({
                from: this.context.account,
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
>>>>>>> origin/test
                    isLoading: false
                });
            })
            .on("error", () => {
<<<<<<< HEAD
                alert("Purchase failed :(");
                this.setState({
=======
                this.setState({
                    alert: {
                        open: true,
                        title: "Error",
                        message: "DRP purchase failed :("
                    },
>>>>>>> origin/test
                    isLoading: false
                });
            });
        }catch(err){
<<<<<<< HEAD
            alert("Purchase failed :( "+err);
            this.setState({
=======
            this.setState({
                alert: {
                    open: true,
                    title: "Error",
                    message: "DRP purchase failed :( "+err.message
                },
>>>>>>> origin/test
                isLoading: false
            }); 
        }
    }

    async checkCCPStatus(){
        this.setState({
            isLoading: true
        });
<<<<<<< HEAD
        const [ccpValidityStatus, ccpContractStatus] = await this.context.contract.methods.getCCPStatus().call();
        if(ccpValidityStatus && ccpContractStatus){
            alert("CCP valid :)");
        }
        else if(ccpValidityStatus && !ccpContractStatus){
            alert("CCP Check Contract is invalid :(");
        }
        else if(!ccpValidityStatus && ccpContractStatus){
            alert("CCP validity has expired :(");
        }
        else{
            alert("CCP validity has expired and CCP Check Contract is invalid :(");
        }
        this.setState({
=======
        const status = await this.context.contract.methods.getCCPStatus().call({
            from: this.context.account
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
>>>>>>> origin/test
            isLoading: false
        });
    }

    async getClientData(){
<<<<<<< HEAD
        const isRegistered = await this.context.contract.methods.isClientRegistered().call();
        const drpList = [];
        if(isRegistered){
            const drpListLength = await this.context.contract.methods.getClientDRPListLength().call();
            for(let i=0; i < drpListLength; i++){
                const [domainName, validFrom, validTo, drpPrice, lastChecked] = await this.context.contract.methods.getClientDRPList(i).call(); // an array of values is returned
                drpList.push({
                    domainName: this.context.web3.utils.hexToUtf8(domainName),
                    validFrom: new Date(validFrom).toISOString().split("T")[0],
                    validTo: new Date(validTo).toISOString().split("T")[0],
                    drpPrice: parseFloat(this.context.web3.utils.fromWei(drpPrice, "ether")),
                    lastChecked: lastChecked > 0 ? new Date(lastChecked).toISOString().split("T")[0] : "-"
=======
        const drpList = [];
        const isRegistered = await this.context.contract.methods.isClientRegistered().call({
            from: this.context.account
        });
        if(isRegistered){
            const drpListLength = await this.context.contract.methods.getClientDRPListLength().call({
                from: this.context.account
            });
            for(let i = parseInt(drpListLength) - 1; i >= 0; i--){
                const drpData = await this.context.contract.methods.getClientDRPList(i).call({
                    from: this.context.account
                }); // an array of values is returned
                drpList.push({
                    drpIndex: i,
                    domainName: this.context.web3.utils.hexToUtf8(drpData[0]),
                    validFrom: new Date(parseInt(drpData[1])*1000).toISOString().split("T")[0],
                    validTo: new Date(parseInt(drpData[2])*1000).toISOString().split("T")[0],
                    drpPrice: this.context.web3.utils.fromWei(drpData[3], "ether"),
                    lastChecked: parseInt(drpData[4]) > 1 ? new Date(parseInt(drpData[4])*1000).toISOString().split("T")[0] : "-"
>>>>>>> origin/test
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
<<<<<<< HEAD
=======
        const alert = this.state.alert;
>>>>>>> origin/test
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
<<<<<<< HEAD
                                        <TableCell align="center" colSpan="3">
=======
                                        <TableCell align="center" colSpan="6">
>>>>>>> origin/test
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
<<<<<<< HEAD
                    update={this.state.isRegistered}
=======
>>>>>>> origin/test
                    onRegister={(clientDetails) => this.handleRegisterCCP(clientDetails)}
                /> 

                <PurchaseDRP 
                    open={this.state.openPurchaseForm} 
                    onClose={() => this.setState({openPurchaseForm: false})}
                    onPurchase={(domain) => this.handlePurchaseDRP(domain)}
                />
<<<<<<< HEAD
=======

                <AlertDialog 
                    open={this.state.alert.open}
                    title={this.state.alert.title}
                    message={this.state.alert.message}
                    isConfirm={this.state.showConfirm}
                    onClose={() => this.setState({
                        alert: {
                            ...alert,
                            open: false
                        },
                        showConfirm: false
                    })}
                    onConfirm={this.state.showConfirm 
                        ?   () => this.deleteDRP(this.state.deleteDRPIndex)
                        :   undefined
                    }
                />
>>>>>>> origin/test
            </div>
        );
    }
}

ClientDashboard.contextType = AppContext;
<<<<<<< HEAD
export default withStyles(useStyles,{ withTheme: true })(ClientDashboard);
=======
export default withStyles(useStyles,{ withTheme: true })(ClientDashboard);
>>>>>>> origin/test
