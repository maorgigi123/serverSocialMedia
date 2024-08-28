const express = require('express')
const http = require('http');
const WebSocket = require('ws');

const cors = require('cors')
const bcrypt = require('bcrypt-nodejs')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
require('dotenv').config();

const Users = require('./Schema/User')
const Posts = require('./Schema/Posts')
const Comments = require('./Schema/Comments')
const Likes = require('./Schema/Likes')
const Saved = require('./Schema/Saved')
const Friends = require('./Schema/Friends')
const MessagesScheme = require('./Schema/Messages')

const HandleRegister = require('./controllers/register')
const HandleSignIn = require('./controllers/login');
const AddPost = require('./controllers/addPost')
const FindPosts = require('./controllers/FindPosts')
const GetUserPosts = require('./controllers/getUserPost')
const UploadProfilePicture = require('./controllers/uploadProfilePicture')
const AddLike = require('./controllers/addLike')
const getUserByUsername = require('./controllers/getUserByUsername')
const addComment = require('./controllers/addComment')
const AddLikeToComment = require('./controllers/addLikeToComment');
const GetAllMessages = require('./controllers/getAllMessages');
const sendMessage = require('./controllers/sendMessage');
const ReadMessage = require('./controllers/readMessage')
const LoadMoreMessages = require('./controllers/loadMoreMessages')
const LoadMoreComments = require('./controllers/LoadMoreCommetns')
const AddFollow = require('./controllers/Followers/AddFollow')
const GetMoreFollowing = require('./controllers/Followers/getMoreFollowing')
const GetMoreFollowers = require('./controllers/Followers/getMoreFollowers')
const CheckMutualFollowing = require('./controllers/Followers/CheckMutualFollowing')
const updatePostView = require('./controllers/updatePostView'); // Adjust path as necessary
const AddReplay = require('./controllers/AddReplay')
const LoadMoreReplies = require('./controllers/LoadMoreReplies')
const AddLikeToCommentOrReply = require('./controllers/AddLikeToCommentOrReply')
const Picks = require('./controllers/picks/Picks')

const path = require('path');


const app = express()
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const mongoURI = process.env.MONGO_URI;

// mongoose.connect('mongodb://localhost:27017',{dbName:'Gigs'})
// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.json({ limit: '600mb' }));
app.use(bodyParser.urlencoded({ limit: '600mb', extended: true }));

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('./uploads'));
// app.use(fileUpload());

app.post('/RegisterPlayer',HandleRegister(Users,bcrypt))
app.post('/signIn',HandleSignIn(Users,bcrypt))
// app.post('/uploadPost',AddPost(Posts,Users))
app.post('/findPosts',FindPosts(Posts,Comments,Users,Likes,Friends))
app.post('/getUserPosts',GetUserPosts(Posts))
app.post('/uploadProfilePicture',UploadProfilePicture(Users))
app.post('/addLike',AddLike(Likes,Posts))
app.post('/getUserByUsername', getUserByUsername(Users,Posts,Friends))
app.post('/addComment',addComment(Comments,Posts))
app.post('/addLikeToComment',AddLikeToComment(Comments,Posts))
app.post('/getAllMessages',GetAllMessages(MessagesScheme,Users))
app.post('/readMessage',ReadMessage(MessagesScheme))
app.post('/getMoreMessages',LoadMoreMessages(MessagesScheme))
app.post('/LoadMoreComments',LoadMoreComments(Posts))
app.post('/AddFollow',AddFollow(Friends,Users))
app.post('/getMoreFollowing', GetMoreFollowing())
app.post('/getMoreFollowers', GetMoreFollowers())
app.post('/check-mutual-following', CheckMutualFollowing());
app.post('/addReplay', AddReplay(Comments,Posts))
app.post('/LoadMoreReplies',LoadMoreReplies(Comments))
app.post('/AddLikeToCommentOrReply',AddLikeToCommentOrReply(Comments))
app.post('/Picks',Picks())

// Route to handle file requests
app.get('/uploads/*', (req, res) => {
    // Remove the leading '/uploads/' from req.url
    const urlPath = req.url.substring('/uploads'.length);
    
    // Decode the URL path
    const decodedPath = decodeURIComponent(urlPath);
    
    // Construct the file path
    const filePath = path.join(__dirname, 'uploads', decodedPath);
    
    // Log the resolved file path for debugging
    // console.log('Resolved File Path:', filePath);

    // Check if file exists before sending
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File not found: ${filePath}`);
            return res.status(404).send('File not found');
        }

        // Send the file
        res.sendFile(filePath);
    });
});


let users = []

const updateUser = (users, newUser) => {
    const index = users.findIndex(user => user.username === newUser.username);
    if (index !== -1) {
        users[index].ws.close(); // Close the old WebSocket connection
        users[index] = newUser;  // Replace the user entry
    } else {
        users.push(newUser); // Add the new user
    }
};

wss.on('connection', (ws,req) => {
    const username = decodeURIComponent(req.url.split('?')[1].split('=')[1]);
    const newUser = {
        ws : ws,
        username : username,
        location : '',
        user : {}
    }
    updateUser(users, newUser);
        console.log('New WebSocket connection ' +username);
        ws.on('message', async(message) => {
        // Parse the received message
        
        const parsedMessageDis = await JSON.parse(message);
        if (parsedMessageDis.type === 'disconnect') {
             const disconnectedUsername = parsedMessageDis.username;
                // Filter out the user with the specified username  
                const updatedUserArray = users.filter(user => user.username !== disconnectedUsername);
                users = updatedUserArray
                console.log(disconnectedUsername +' disconnect')
                console.log('now online ', users.length)
        }
        else if (parsedMessageDis.type === 'update-view'){
            const { postId, userId } = parsedMessageDis.payload;
            
            try {
                if (!postId || !userId) {
                    return res.status(400).json({ error: 'postId and userId are required' });
                }
                await updatePostView(Posts, postId, userId);
            } catch (error) {
                console.error('Error updating view:', error);
            }
        
        }
        else if(parsedMessageDis.type === 'UpdateLocation'){
            const {location, username } = parsedMessageDis.payload;
            const index = users.findIndex(user => user.username === username.username);
            if (index !== -1) {
                users[index].location = location;  // Replace the user entry
                users[index].user = username; 
                // console.log(users[index])
            }

            users.map((user,_index) => {
                if(index !== _index){
                    console.log('UpdateLocation for',users[_index].username)
                    try{
                        user.ws.send(JSON.stringify({ newLocationUpdate:users[index].location, username: username}))
                    }
                    catch(e){
                        console.log('error while send new location')
                    }
                }
            })
            
        }

        else if(parsedMessageDis.type === 'getAllPlayersLocation'){
            const { username } = parsedMessageDis.payload;
            users.map((user) => {
                if(user.username === username.username){
                    console.log('get all players online :' ,users.length,)
                    user.ws.send(JSON.stringify({ allPlayersLocation:users}))
                }
            })
            
        }


        else if( parsedMessageDis.type === 'updateRead'){
            const parsedMessage = parsedMessageDis.payload;
            const _username = parsedMessageDis.username;
            const _recipient = parsedMessageDis.recipient
            users.map((user) => {
                if(user.username === _username ){
                    console.log(`update Read to ${_username}`);
                    user.ws.send(JSON.stringify({ updateRead:parsedMessage }))
                }
                else if(user.username === _recipient ){
                    console.log(`update Read to ${_recipient}`);
                    user.ws.send(JSON.stringify({ updateRead:parsedMessage }))
                }
            })
        }
        else if( parsedMessageDis.type === 'UploadPost'){
            const {userId,username,content,tags,images,cover,folder,typePost} =parsedMessageDis.payload;
            try {
                const result = await AddPost(Posts, Users, userId, tags, content, images, username, cover, folder,typePost);
                users.map((user) => {
                    if(user.username === username){
                        console.log(`Sending finished upload post to ${username}`);
                        user.ws.send(JSON.stringify({ uploadPost:'finish' }))
                    }
                })
            } catch (error) {
                console.log(error)
                users.map((user) => {
                    if(user.username === username){
                        user.ws.send(JSON.stringify({ uploadPost:'error' }))
                    }
                })
            }        

        }
        else{
            const parsedMessage = await JSON.parse(message).message;
        
            const send = parsedMessage.send;
            const recipient = parsedMessage.recipient;
            const recipientName = parsedMessage.recipientName;
            const content = parsedMessage.content;
            const newMessage = parsedMessage.newMessage;
            const image = parsedMessage.image;
            const senderName = parsedMessage.senderName;
            const Message = await sendMessage(MessagesScheme,send,recipient,content,image,recipientName,senderName)
            users.map((user) => {
                if(user.username === recipientName){
                    console.log(`Sending message to ${recipientName}`);
                    user.ws.send(JSON.stringify({ newMessage:Message.message, chatId : Message.chatId }))
                }
                else if(user.username == senderName ){
                    console.log(`Sending message to ${senderName}`);
                    user.ws.send(JSON.stringify({ newMessage:Message.message }))
                }
            })
        }

        
   

        // ws.send(JSON.stringify({ message: `Server received: ${sendMessageSuccessfully}` }));
    });

    ws.on('close', () => {
        // console.log('Client WebSocket connection closed');
    });

    ws.on('error', (error) => {
        console.log('WebSocket error:', error);
    });

    // ws.send(JSON.stringify({ message: 'Welcome to the chat!' }));
});

server.listen(3001, () => {
    console.log('server is running on port 3001')
})