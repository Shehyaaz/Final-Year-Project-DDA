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
                            It is a system for detecting and automatically responding to Domain misbehavior with smart contracts on
                            Ethereum Blockchain. This provides an approach for enhancing the security of
                            TLS handshake authentication protocols. In general, ETDA system extends the traditional TLS ecosystem where domains
                            interact with clients by carrying out TLS handshake with Ethereum blockchain.
                        </Typography>
                        <br />
                        <Typography variant="h4" gutterBottom>
                            How to use this system
                        </Typography>
                        <Typography variant="body1" gutterBottom className={classes.content}>
                            Tells how to use DDA
                        </Typography>
                        <br /><br />
                        <Typography variant="h4" gutterBottom>
                            Terms and Conditions
                        </Typography>
                        <Typography variant="h6" gutterBottom className={classes.content}>
                            Clients
                        </Typography>
                        <ul>
                            <li>Condition 1.</li>
                            <li>Condition 2.</li>
                            <li>Condition 3.</li>
                        </ul>
                        <Typography variant="h6" gutterBottom className={classes.content}>
                            Domains
                        </Typography>
                        <ul>
                            <li>Condition 1.</li>
                            <li>Condition 2.</li>
                            <li>Condition 3.</li>
                        </ul>
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