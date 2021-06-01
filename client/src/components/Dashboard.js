import React, { Component } from "react";
import clsx from "clsx";
import { 
    Redirect, 
    withRouter 
} from "react-router";
import { 
    Route,
    Switch,
    Link
} from "react-router-dom";
import {
    AppBar,
    Drawer,
    Divider,
    CssBaseline,
    Toolbar,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from "@material-ui/core";
import {
    Menu,
    ChevronLeft,
    ChevronRight,
    PeopleAlt,
    Dns,
    AccountCircle,
    Info,
    ExitToApp
} from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";
import AppContext from "../context/AppContext";
import ClientDashboard from "./ClientDashboard";
import DomainDashboard from "./DomainDashboard";
import Account from "./Account";
import About from "./About";

const drawerWidth = 240;

const useStyles = theme => ({
  root: {
    display: 'flex',
  },
  title: {
      flexGrow: 1,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
});

class Dashboard extends Component {
    constructor(props){
        super(props);
        this.state = {
            drawerOpen: false,
            isLoggedIn: (sessionStorage.getItem("isLoggedIn") === "true") || false
        };
        this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
        this.handleDrawerClose = this.handleDrawerClose.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount(){
        window.ethereum.on("accountsChanged",(accounts)=>{
            this.context.setContext({
                account: accounts[0]
            });
        });
        window.onbeforeunload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.onunload = (event) => {
            this.handleLogout();
        }
    }

    componentWillUnmount(){
        window.ethereum.removeListener("accountsChanged",(accounts)=>{
            this.context.setContext({
                account: accounts[0]
            });
        });
    }

    handleLogout(){
        sessionStorage.setItem("isLoggedIn", false);
        this.setState({
            isLoggedIn: false
        });
    }

    handleDrawerOpen(){
        this.setState({
            drawerOpen: true
        });
    }

    handleDrawerClose(){
        this.setState({
            drawerOpen: false
        });
    }

    render() {
        if(!this.state.isLoggedIn){
            return(
                <Redirect to = "/" />
            );
        }
        const classes = this.props.classes;
        const theme = this.props.theme;
        return (
            <div className={classes.root}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    className={clsx(classes.appBar, {
                    [classes.appBarShift]: this.state.drawerOpen,
                    })}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={this.handleDrawerOpen}
                            edge="start"
                            className={clsx(classes.menuButton, {
                            [classes.hide]: this.state.drawerOpen,
                            })}
                        >
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" noWrap className={classes.title}>
                            Dashboard
                        </Typography>
                        <IconButton edge="end" aria-label="account" color="inherit"
                            component={Link} to="/dashboard/account" >
                            <AccountCircle />
                        </IconButton>
                        <IconButton edge="end" aria-label="logout" color="inherit"
                            onClick={this.handleLogout} >
                            <ExitToApp />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    className={clsx(classes.drawer, {
                        [classes.drawerOpen]: this.state.drawerOpen,
                        [classes.drawerClose]: !this.state.drawerOpen,
                    })}
                    classes={{
                        paper: clsx({
                            [classes.drawerOpen]: this.state.drawerOpen,
                            [classes.drawerClose]: !this.state.drawerOpen,
                        }),
                    }}
                >
                    <div className={classes.toolbar}>
                        <IconButton onClick={this.handleDrawerClose}>
                            {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                        </IconButton>
                    </div>
                    <Divider />
                    <List component="nav" aria-label="dashboard options">
                        <ListItem button component={Link} to="/dashboard/about">
                            <ListItemIcon>
                                <Info />
                            </ListItemIcon>
                            <ListItemText primary="About" />
                        </ListItem>
                        <ListItem button component={Link} to="/dashboard/client">
                            <ListItemIcon>
                                <PeopleAlt />
                            </ListItemIcon>
                            <ListItemText primary="Client" />
                        </ListItem>
                        <ListItem button component={Link} to="/dashboard/domain">
                            <ListItemIcon>
                                <Dns />
                            </ListItemIcon>
                            <ListItemText primary="Domain" />
                        </ListItem>
                        <ListItem button component={Link} to="/dashboard/account">
                            <ListItemIcon>
                                <AccountCircle />
                            </ListItemIcon>
                            <ListItemText primary="Your Account" />
                        </ListItem>
                        <ListItem button onClick={this.handleLogout}>
                            <ListItemIcon>
                                <ExitToApp />
                            </ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </List>
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Switch>
                        <Route path="/dashboard/client" component={ClientDashboard} />
                        <Route path="/dashboard/domain" component={DomainDashboard} />
                        <Route path="/dashboard/account" component={Account} />
                        <Route path="/dashboard/about" component={About} />
                    </Switch>
                </main>
            </div>
        );
    }
}

Dashboard.contextType = AppContext;

export default withRouter(withStyles(useStyles, {withTheme : true})(Dashboard));