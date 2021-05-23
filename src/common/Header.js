import React, {Component} from 'react';
import './Header.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import InputBase from '@material-ui/core/InputBase';
import {withStyles} from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import { Link } from 'react-router-dom';
import { Typography } from '@material-ui/core';

//Code for header component. Depending upon the value of screen , appropriate details will be shown.

// Added styling
const styles = theme => ({
    grow: {
        flexGrow: 1
    },
    appHeader:{
        backgroundColor:'#263238'
    },
    hr:{
        height:'1.5px',
        backgroundColor:'#f2f2f2',
        marginLeft:'5px',
        marginRight:'5px'
    },
    search: {
        position: 'relative',
        borderRadius: '4px',
        backgroundColor: '#c0c0c0',
        marginLeft: 0,
        width: '300px',
    },
    searchIcon: {
        width: theme.spacing.unit * 4,
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color:'#000000'
    },
    inputInput: {
        paddingTop: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingLeft: theme.spacing.unit * 4,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 120,
            '&:focus': {
                width: 200
            }
        }
    },
    avatar: {
        width: 50,
        height: 50,
    }
})

//added block to render header
class Header extends Component{

    constructor(props){
        super(props);
        this.state = {
            anchorEl: null,
        };
    }

    render(){
        const {classes,screen} = this.props;
        return (
            <div>
            <AppBar className={classes.appHeader}>
                <Toolbar>
                    <Link style={{ textDecoration: 'none', color: 'white' }} to="/home">
                        <Typography variant="h6" className={this.props.classes.title}>
                            Image Viewer
                        </Typography>
                    </Link>
                    <div className={classes.grow}/>
                    {(screen === "Home") &&
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <SearchIcon />
                        </div>
                        <InputBase onChange={(e)=>{this.props.searchHandler(e.target.value)}} placeholder="Search…" classes={{
                            input: classes.inputInput
                        }}/>
                    </div>
                    }
                    {(screen === "Home" || screen === "Profile")  &&
                    <div>
                        <IconButton onClick={this.handleIconClick}>
                            <Avatar alt="Profile Pic" src={this.props.userProfileUrl} className={classes.avatar} style={{border: "1px solid #fff"}}/>
                        </IconButton>
                        <Popover
                            id="simple-menu"
                            anchorEl={this.state.anchorEl}
                            open={Boolean(this.state.anchorEl)}
                            onClose={this.handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}>
                            <div style={{padding:'5px'}}>
                                { (screen === "Home") &&
                                <div>
                                    <MenuItem onClick={this.handleGoToMyAccount}>My Account</MenuItem>
                                    <div className={classes.hr}/>
                                </div>
                                }
                                <MenuItem onClick={this.handleLogout}>Logout</MenuItem>
                            </div>
                        </Popover>
                    </div>
                    }
                </Toolbar>
            </AppBar>
        </div>)
    }

    handleIconClick = (event) =>{
        this.setState({
            anchorEl: event.currentTarget
        })
    }

    handleClose = () =>{
        this.setState({ anchorEl: null });
    }

    handleGoToMyAccount = ()=>{
        this.props.handleGoToMyAccount();
        this.handleClose();
    }

    handleLogout = ()=>{
        this.props.handleLogout();
        this.handleClose();
    }
}
export default withStyles(styles)(Header)