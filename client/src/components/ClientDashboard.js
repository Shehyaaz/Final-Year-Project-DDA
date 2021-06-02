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
	}

    DataRow = row => (
        <TableRow key={row.drpIndex}>
          <TableCell>{row.domainName}</TableCell>
          <TableCell>{row.validFrom}</TableCell>
          <TableCell>{row.validTo}</TableCell>
          <TableCell>{row.drpPrice}</TableCell>
          <TableCell>{row.lastChecked}</TableCell>
          <TableCell>
              <Button color="secondary" size="small" endIcon={<VerifiedUserOutlined/>}
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
        .then((res) => {
            // call check certificate function from contract
            const sctLogID = res.sctList.map(sct => sct.logID);
            const sctTimestamp = res.sctList.map(sct => sct.timestamp);
            this.context.contract.checkCertificate(
                drpIndex,
                sctLogID,
                sctTimestamp,
                res.certValidFrom,
                res.certValidTo
            ).send({
                from: this.state.account
            })
            .on("receipt", async(receipt) => {
                // certificate check was executed
                if(receipt.events.CertChecked && receipt.events.CertChecked.returnValues._certValid){
                    alert(domainName+" certificate is Valid");
                    this.setState({
                        isLoading: false
                    });
                }
                else{
                    alert(domainName+" has an INVALID certificate !");
                    await this.getClientData();
                    this.setState({
                        isLoading: false
                    });
                }
            })
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
            const updateFee = await this.context.contract.client_update_fee;
            // update client details
            try{
                this.context.contract.methods.updateClient(
                    Math.floor(new Date(clientDetails.validTo).getTime()/1000),
                    clientDetails.ccpAddress
                ).send({
                    from: this.state.account,
                    value: updateFee
                })
                .on("receipt", () => {
                    alert(clientDetails.clientName+" details updated successfully !");
                    this.setState({
                        isLoading: false
                    });
                })
                .on("error", () => {
                    alert(clientDetails.clientName+" updation failed !");
                    this.setState({
                        isLoading: false
                    });
                });
            }catch(err){
                alert(clientDetails.clientName+" updation failed !");
                this.setState({
                    isLoading: false
                });
            }
        }
        else{
            // get registration fee from blockchain
            const registerFee = await this.context.contract.client_registration_fee;
            // register client details
            try{
                this.context.contract.methods.registerClient(
                    this.context.web3.utils.utf8ToHex(clientDetails.clientName),
                    Math.floor(new Date(clientDetails.validFrom).getTime()/1000),
                    Math.floor(new Date(clientDetails.validTo).getTime()/1000),
                    clientDetails.ccpAddress,
                    clientDetails.version
                ).send({
                    from: this.state.account,
                    value: registerFee
                })
                .on("receipt", () => {
                    alert(clientDetails.clientName+" registered successfully !");
                    this.setState({
                        isLoading: false
                    });
                })
                .on("error", () => {
                    alert(clientDetails.clientName+" registration failed !");
                    this.setState({
                        isLoading: false
                    });
                });
            }catch(err){
                alert(clientDetails.clientName+" registration failed !");
                this.setState({
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
            this.context.contract.methods.purchaseDRP(domain.domainAddress).send({
                from: this.state.account,
                value: parseInt(this.context.web3.utils.toWei(domain.drpPrice, "ether"))
            })
            .on("receipt", () => {
                alert("Successfully purchased "+domain.domainName+" DRP");
                this.setState({
                    isLoading: false
                });
            })
            .on("error", () => {
                alert("Purchase failed :(");
                this.setState({
                    isLoading: false
                });
            });
        }catch(err){
            alert("Purchase failed :( "+err);
            this.setState({
                isLoading: false
            }); 
        }
    }

    async checkCCPStatus(){
        this.setState({
            isLoading: true
        });
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
            isLoading: false
        });
    }

    async getClientData(){
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
                    onPurchase={(domain) => this.handlePurchaseDRP(domain)}
                />
            </div>
        );
    }
}

ClientDashboard.contextType = AppContext;
export default withStyles(useStyles,{ withTheme: true })(ClientDashboard);
