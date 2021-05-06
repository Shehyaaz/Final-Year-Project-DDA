import React, {Component,useState} from 'react';
import { 
  Box,
  Link,
  Grid,
	Typography,
  Paper 	
} from '@material-ui/core';

import './app.css';

function FooterText() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Link color="inherit" href="">
       Decentralised Domain Auth.
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

class About extends Component {
  
  render() {
    return (
      <div className="body">
        <h2>About Decentralised Domain Authentication</h2>
        <p>It is a system for detecting
and automatically responding to Domain misbehavior with smart contracts on
Ethereum Blockchain. This provides an approach for enhancing the security of
TLS handshake authentication protocols. <br></br>In general, ETDA system extends the traditional TLS ecosystem where domains
interact with clients by carrying out TLS handshake with Ethereum blockchain.</p>
        <h3>System Usage Details</h3>
        <p>Steps to use the system.</p>
        <br></br>
        <h3>Terms and Conditions:
        </h3>
        <p>Condition 1.</p>
        <p>Condition 2.</p>
        <p>Condition 3.</p><br></br>
        <h3>Developers
        </h3>
        <Grid container spacing={3}>
        <Grid item xs={3}>
          <img src="/sufiyan.png" alt="dda-logo" height={100}/>
          <Paper className="paper">Mohammed Sufiyan Aman</Paper>
        </Grid>
        <Grid item xs={3}>
          <img src="/sakshi.png" alt="dda-logo" height={100}/> 
          <Paper className="paper">Shakshi Pandey</Paper>
        </Grid>
        <Grid item xs={3}>
          <img src="/shehyaz.png" alt="dda-logo" height={100}/>
          <Paper className="paper">Shehyaaz Khan Nayazi</Paper>
        </Grid>
        <Grid item xs={3}>
          <img src="/riyanchi.png" alt="dda-logo" height={100}/>
          <Paper className="paper">Riyanchhi Agrawal</Paper>
        </Grid>
      </Grid>
        <Box mt={5}>  <FooterText />	</Box>
      </div>
    );
  }
}

export default About;