import React, {Component} from 'react';
import './Home.css';
import Header from '../../common/Header';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import {withStyles} from '@material-ui/core/styles';
import FavoriteIconBorder from '@material-ui/icons/FavoriteBorder';
import FormControl from '@material-ui/core/FormControl';
import FavoriteIconFill from '@material-ui/icons/Favorite';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import profilePicture from "../../assets/Rainbow1.jpg"

const styles =  theme => ({
    card: {
        maxWidth: 1100
    },
    avatar: {
        margin: 10
    },
    media: {
        height:0,
        paddingTop: '50%'
    },
    formControl: {
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'baseline'
    },
    gridList:{
        width: 1100,
        height: 'auto',
        overflowY: 'auto'
    },
    grid:{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        marginTop:90
    },
    hr:{
        marginTop:'10px',
        borderTop:'2px solid #f2f2f2'
    },
    comment:{
        display:'flex',
        alignItems:'center'
    }
});

/*
 Component to render home page.
 Profile image is not available in API response. Hence a static image is being displayed
 The initial count of 'Likes' has been hardcoded.
 */

class Home extends Component{

    constructor(props) {
        super(props);
        if (sessionStorage.getItem('access-token') == null) {
            props.history.replace('/');
        }
        this.state = {
            data: [],
            filteredData:[],
            userData:{},
            likeSet:new Set(),
            comments:{},
            currrentComment:""
        }
    }

    componentDidMount(){
        let that = this;
        let url = `https://graph.instagram.com/me/media?fields=id,caption&access_token=${sessionStorage.getItem('access-token')}`;

        return fetch(url,{
            method:'GET',
        }).then((response) =>{
            return response.json();
        }).then((jsonResponse) =>{
            const mediaArray = jsonResponse.data;
            const mediaInfo = []

            return  Promise.all(
                mediaArray.map(x => {
                    return new Promise((resolve) => {
                        let url = `https://graph.instagram.com/${x.id}?fields=id,media_type,media_url,username,timestamp&access_token=${sessionStorage.getItem('access-token')}`;
                        fetch(url,{
                            method:'GET',
                        })
                            .then(response => {
                                return new Promise(() => {
                                    response.json()
                                        .then(media => {
                                            mediaInfo.push(media)
                                            resolve()
                                        })
                                })
                            })
                    })
                })
            )
                .then(() => {
                    mediaInfo.forEach(media=>{
                        const m = mediaArray.filter(x=>x.id===media.id);
                        media['caption'] = m[0].caption;
                        media['likes_count'] = 2;

                        let regex = /#(\w+)/g;
                        media['hashtags'] =  media.caption.match(regex);
                        media['hashtags'] =   media['hashtags']?media['hashtags'].join(' ') : ''
                        media.caption  = media.caption.replace(/#([^\s]*)/gm, '');
                    })
                    that.setState({
                        data:mediaInfo,
                        filteredData:mediaInfo
                    });
                })
        }).catch((error) => {});
    }

    render(){
        const{classes} = this.props;
        return(
            <div>
                <Header
                    userProfileUrl={profilePicture}
                    screen={"Home"}
                    searchHandler={this.onSearchEntered}
                    handleLogout={this.logout}
                    handleGoToMyAccount={this.navigateToAccount}/>
                <div className={classes.grid}>
                    <GridList className={classes.gridList} cellHeight={'auto'}>
                        {this.state.filteredData.map(item => (
                            <GridListTile key={item.id}>
                                <HomeItem
                                    classes={classes}
                                    item={item}
                                    onClickLike={this.likeClickHandler}
                                    onClickAddComment={this.addCommentHandler}
                                    commentChangeHandler={this.commentChangeHandler}
                                    comments={this.state.comments}/>
                            </GridListTile>
                        ))}
                    </GridList>
                </div>
            </div>
        );
    }

    onSearchEntered = (value) =>{
        console.log('search value', value);
        let filteredData = this.state.data;
        filteredData = filteredData.filter((data) =>{
            let string = data.caption.toLowerCase();
            let subString = value.toLowerCase();
            return string.includes(subString);
        })
        this.setState({
            filteredData
        })
    }

    likeClickHandler = (id) =>{
        var foundItem = this.state.data.find((item) => {
            return item.id === id;
        })
        if (typeof foundItem !== undefined) {
            if (!this.state.likeSet.has(id)) {
                foundItem.likes_count++;
                this.setState(({likeSet}) => ({
                    likeSet:new Set(likeSet.add(id))
                }))

            }else {
                foundItem.likes_count--;
                this.setState(({likeSet}) =>{
                    const newLike = new Set(likeSet);
                    newLike.delete(id);

                    return {
                        likeSet:newLike
                    };
                });
            }
        }
    }

    addCommentHandler = (id)=>{
        if (this.state.currentComment === "" || typeof this.state.currentComment === undefined) {
            return;
        }

        let commentList = this.state.comments.hasOwnProperty(id)?
            this.state.comments[id].concat(this.state.currentComment): [].concat(this.state.currentComment);

        this.setState({
            comments:{
                ...this.state.comments,
                [id]:commentList
            },
            currentComment:''
        })
        sessionStorage.setItem(id+'comment',JSON.stringify([...commentList]));
    }


    commentChangeHandler = (e) => {
        this.setState({
            currentComment:e.target.value
        });
    }



    logout = () => {
        sessionStorage.clear();
        this.props.history.replace('/');
    }

    navigateToAccount = () =>{
        this.props.history.push('/profile');
    }
}

class HomeItem extends Component{
    constructor(){
        super();
        this.state = {
            isLiked : false,
            comment:'',
        }
    }

    render(){
        const {classes, item, comments} = this.props;

            let createdTime = new Date(item.timestamp);
            let yyyy = createdTime.getFullYear();
            let mm = createdTime.getMonth() + 1 ;
            mm = mm>=10?mm:'0'+mm;
            let dd = createdTime.getDate() >=10 ?createdTime.getDate() : '0'+ createdTime.getDate() ;
            let HH = createdTime.getHours() >=10 ?createdTime.getHours() : '0'+createdTime.getHours() ;
            let MM = createdTime.getMinutes()>=10?createdTime.getMinutes() : '0'+createdTime.getMinutes();
            let ss = createdTime.getSeconds()>=10?createdTime.getSeconds() : '0'+createdTime.getSeconds();
            let time = dd+"/"+mm+"/"+yyyy+" "+HH+":"+MM+":"+ss;

        return(
            <div className="home-item-main-container">
                <Card className={classes.card}>
                    <CardHeader
                        avatar={
                            <Avatar alt="User Profile Pic" src={profilePicture} className={classes.avatar}/>
                        }
                        title={item.username}
                        subheader={time}
                    />
                    <CardContent>
                        <CardMedia
                            className={classes.media}
                            image={item.media_url}
                            title={item.caption}
                        />
                        <div  className={classes.hr}>
                            <Typography component="p">
                                {item.caption}
                            </Typography>
                            <Typography style={{color:'#4dabf5'}} component="p" >
                                {item.hashtags}
                            </Typography>
                        </div>
                    </CardContent>

                    <CardActions>
                        <IconButton aria-label="Add to favorites" onClick={this.onLikeClicked.bind(this,item.id)}>
                            {this.state.isLiked && <FavoriteIconFill style={{color:'#F44336'}}/>}
                            {!this.state.isLiked && <FavoriteIconBorder/>}
                        </IconButton>
                        <Typography component="p">
                            {item.likes_count} Likes
                        </Typography>
                    </CardActions>

                    <CardContent>
                        {comments.hasOwnProperty(item.id) && comments[item.id].map((comment, index)=>{
                            return(
                                <div key={index} className="row">
                                    <Typography component="p" style={{fontWeight:'bold' }} >
                                        {sessionStorage.getItem('username')}:
                                    </Typography>
                                    <Typography component="p" style={{marginLeft:'4px' }} >
                                        {comment}
                                    </Typography>
                                </div>
                            )
                        })}

                        <div className={classes.formControl}>
                            <FormControl style={{flexGrow:1}}>
                                <InputLabel htmlFor="comment">Add Comment</InputLabel>
                                <Input id="comment" value={this.state.comment} onChange={this.commentChangeHandler}/>
                            </FormControl>
                            <FormControl>
                                <Button style={{marginLeft:'1rem' }} onClick={this.onClickAddComment.bind(this,item.id)}
                                        variant="contained" color="primary">
                                    ADD
                                </Button>
                            </FormControl>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    onLikeClicked = (id) => {
        if (this.state.isLiked) {
            this.setState({
                isLiked:false
            });
        }else {
            this.setState({
                isLiked:true
            });
        }
        this.props.onClickLike(id)
    }

    onClickAddComment = (id) => {
        if (this.state.comment === "" || typeof this.state.comment === undefined) {
            return;
        }
        this.setState({
            comment:""
        });
        this.props.onClickAddComment(id);
    }

    commentChangeHandler = (e) => {
        this.setState({
            comment:e.target.value,
        });
        this.props.commentChangeHandler(e);
    }
}

export default withStyles(styles)(Home);