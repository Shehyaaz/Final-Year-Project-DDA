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
    Block
} from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import DRPRegistration from "./DRPRegistration";
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


class DomainDashboard extends Component {
    constructor(props){
		super(props);
        this.state={
            account: '',
            isLoading: false,
            isRegistered: false,
            openRegistrationForm: false,
            numInvalid: 0
        }
		this.handleRegisterDRP = this.handleRegisterDRP.bind(this);
	}

    handleRegisterDRP(domainDetails){
        this.setState({
            //isLoading: true,
            openRegistrationForm: false
        });
        console.log(domainDetails);
        // TODO: send details to blockchain
        this.state.isRegistered
        ? console.log("Updated DRP")
        : console.log("Registered DRP");
    }

    componentDidMount(){
        // TODO: check if domain is already registered and update state
        this.setState({
            account: this.context.account
        });        
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.account !== this.context.account){
            // TODO: get domain data when ethereum account is changed
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
                    item
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
                                    To register in the system, the user(domain) must specify a Domain Reaction Policy
                                    or DRP
                                </Typography>
                            </CardContent>
                            <CardActions disableSpacing>
                                <Button color="primary"
                                    startIcon={<PersonAdd/>}
                                    onClick={() => this.setState({openRegistrationForm:true})}
                                    disableElevation
                                    size="small"    
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
                                <Avatar aria-label="purchase-drp" className={classes.avatar}>
                                    <Block />
                                </Avatar>
                                }
                                title="Invalid Certificates"
                            />
                            <CardContent>
                                <Typography variant="body2" color="textSecondary" component="p">
                                    Number of certificates determined to be invalid by clients who use
                                    the system.
                                </Typography>
                                <br />
                                <Typography gutterBottom variant="h5" component="h2" color="error">
                                    {this.state.numInvalid}
                                </Typography>
                            </CardContent>
                        </Card>
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
