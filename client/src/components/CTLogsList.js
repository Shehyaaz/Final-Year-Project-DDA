import React, { Component } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText
} from "@material-ui/core";
import {
    VerifiedUser
} from "@material-ui/icons";

class CTLogsList extends Component {
    constructor(props){
        super(props);
        this.state={
            ctLogs: []
        };
        this.loadCTLogs = this.loadCTLogs.bind(this);
    }

    async loadCTLogs(){
        this.setState({
            isLoading: true
        });
        fetch("/getctlogs")
        .then((res) => {
            this.setState({
                ctLogs: res,
                isLoading: false
            });
        })
        .catch((err) => {
            this.setState({
                ctLogs: [],
                isLoading: false
            });
        });
    }

    ctListItem = ctLog => (
        <ListItem>
            <ListItemIcon>
                <VerifiedUser />
            </ListItemIcon>
            <ListItemText primary={ctLog.description} />
        </ListItem>
    );

    render() {
        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="xs"
                onEntering={this.loadCTLogs}
                aria-labelledby="ctlog-title"
                open={this.props.open}
            >
                <DialogTitle id="ctlog-title">List of Trusted CT logs</DialogTitle>
                {this.state.isLoading
                    ? <DialogContent>
                            <CircularProgress color = "secondary"/>
                      </DialogContent>
                    : <DialogContent dividers>
                        {this.state.ctLogs.length === 0
                            ? "List of CT logs is empty !"
                            : <List>
                                {this.state.ctLogs.map((ctLog) => this.ctListItem(ctLog))}
                            </List>
                        }
                      </DialogContent>}
                <DialogActions>
                    <Button autoFocus onClick={() => this.props.handleOk()} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default CTLogsList;
