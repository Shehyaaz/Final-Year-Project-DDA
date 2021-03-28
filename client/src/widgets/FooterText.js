import React from "react";

import {
    Typography,
    Link
} from "@material-ui/core";

export default function FooterText() {
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