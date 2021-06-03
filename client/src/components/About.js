import React, { Component } from "react";
import { 
    Box,
    Grid,
    Typography,
    Paper, 	
    Avatar
  } from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import FooterText from "../widgets/FooterText";

const useStyles = theme => ({
    root: {
      display: 'flex',
    },
    large: {
        width: theme.spacing(9),
        height: theme.spacing(9),
    },
    content: {
        padding: theme.spacing(1),
    },
});

class About extends Component {
    render() {
        const classes = this.props.classes;
        return (
            <div className={classes.root}>
                <Grid 
                    container
                    component="main"
                    direction="column"
                    spacing={4}
                >
                    <Grid item xs={12} sm={12}>
                        <Typography variant="h3" gutterBottom>
                            About Decentralised Domain Authentication
                        </Typography>
                        <Typography variant="body1" gutterBottom className={classes.content}>
                            Decentralised Domain Authentication is a system for detecting and automatically responding to Domain misbehavior with smart contracts on
                            Ethereum Blockchain. This provides an approach for enhancing the security of
                            TLS handshake authentication protocols. In general, DDA system extends the traditional TLS ecosystem where domains
                            interact with clients by carrying out TLS handshake with Ethereum blockchain.
                        </Typography>
                        <br />
                        <Typography variant="h4" gutterBottom>
                            How to use this system
                        </Typography>
                        <Typography variant="body1" gutterBottom className={classes.content}>
                            To use the system, the user must first register in the system. The user can register either as a
                            client or as a domain or both. To register as a client, the user must navigate to the Client Dashboard
                            and click "Register CCP". To register as a domain, the user must navigate to the Domain Dashboard and
                            click "Register DRP". Once registered, the user can explore the Dashboards to access the various functions
                            offered by the system.
                        </Typography>
                        <br /><br />
                        <Typography variant="h4" gutterBottom>
                            Terms and Conditions
                        </Typography>
                        <Typography variant="h6" gutterBottom className={classes.content}>
                            Clients
                        </Typography>
                        <ol type="I">
                            <li>
                                <Typography variant="body1">
                                    The Client must provide a valid Check Contract address when registering/updating details in the system.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    The Check Contract must be a valid smart contract deployed in the blockchain.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    The Check Contract must mandatorily inherit{' '} 
                                    <a  href = "https://github.com/Shehyaaz/Final-Year-Project-DDA/blob/shehyaaz/contracts/CheckInterface.sol"
                                        target="_blank" rel="noopener noreferrer"
                                    >
                                        CheckInterface.sol
                                    </a>
                                    {' '}and implement the abstract functions in that smart contract interface.
                                    </Typography>
                            </li>
                        </ol>
                        <Typography variant="h6" gutterBottom className={classes.content}>
                            Domains
                        </Typography>
                        <ol type="I">
                            <li>
                                <Typography variant="body1">
                                    The Domain must provide a valid domain name and issuer name. The domain name must be publicly accessible
                                    on the Internet and must belong solely to the domain owner.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    The certificate issued by the Domain during TLS handshake must follow the X.509v3 certificate standard.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    The Domain must provide a valid React Contract address when registering/updating details in the system.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    The React Contract must be a valid smart contract deployed in the blockchain.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    The React Contract must mandatorily inherit{' '} 
                                    <a  href = "https://github.com/Shehyaaz/Final-Year-Project-DDA/blob/shehyaaz/contracts/DRPInterface.sol"
                                        target="_blank" rel="noopener noreferrer"
                                    >
                                        DRPInterface.sol
                                    </a>
                                    {' '}and implement the abstract functions in that smart contract interface.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    The Domain must accept all payments made towards the DDA system.
                                </Typography>    
                            </li>
                            <li>
                                <Typography variant="body1">
                                    When a Client purchases a DRP, <b>50%</b> of the purchase amount will be ecrowed by the smart contract.
                                    The escrowed amount will be returned to the Domain when the Domain expires its DRP.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    In the event of detection of Invalid Certificate, <b>90%</b> of the DRP price will be fined as misbehaviour
                                    payment, and <b>30%</b> of the DRP price will be fined as contract fund payment.
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body1">
                                    In the event of detection of Invalid Certificate, the Domain's React Contract will be destroyed, making
                                    the contract inaccessible.
                                </Typography>
                            </li>
                        </ol>
                    </Grid>
                    <Grid container item spacing={3}>
                        <Grid item xs={12} sm={12}>
                            <Typography variant="h4" gutterBottom>
                                Developers
                            </Typography>
                        </Grid>
                        <Grid container direction="column" alignItems="center" item justify="center" xs={3}>
                            <Grid item>
                                <Avatar src="/images/sufiyan.png" alt="Sufiyan" className={classes.large}/>
                            </Grid>
                            <Grid item>
                                <Paper elevation={0}>Mohammed Sufiyan Aman</Paper>
                            </Grid>
                        </Grid>
                        <Grid container direction="column" alignItems="center" item justify="center" xs={3}>
                            <Grid item>
                                <Avatar src="/images/riyanchhi.png" alt="Riyanchhi" className={classes.large}/>
                            </Grid>
                            <Grid item>
                                <Paper elevation={0}>Riyanchhi Agrawal</Paper>
                            </Grid>
                        </Grid>
                        <Grid container direction="column" alignItems="center" item justify="center" xs={3}>
                            <Grid item>
                                <Avatar src="/images/sakshi.png" alt="Shakshi" className={classes.large}/>
                            </Grid>
                            <Grid item>
                                <Paper elevation={0}>Shakshi Pandey</Paper>
                            </Grid>
                        </Grid>
                        <Grid container direction="column" alignItems="center" item justify="center" xs={3}>
                            <Grid item>
                                <Avatar src="/images/shehyaaz.png" alt="Nayazi" className={classes.large}/>
                            </Grid>
                            <Grid item>
                                <Paper elevation={0}>Shehyaaz Khan Nayazi</Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                        <Box mt={5}>  
                            <FooterText />
                        </Box>
                    </Grid>
                </Grid>
          </div>
        );
    }
}

export default withStyles(useStyles,{ withTheme: true })(About);