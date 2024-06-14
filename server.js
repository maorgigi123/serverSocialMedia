const express = require('express')
const http = require('http');
const WebSocket = require('ws');

const cors = require('cors')
const bcrypt = require('bcrypt-nodejs')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

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
const app = express()
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect('mongodb://localhost:27017',{dbName:'Gigs'})

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json())
app.use(cors())
app.use(express.static('uploads')); 
app.use(fileUpload());

app.post('/RegisterPlayer',HandleRegister(Users,bcrypt))
app.post('/signIn',HandleSignIn(Users,bcrypt))
app.post('/uploadPost',AddPost(Posts,Users))
app.post('/findPosts',FindPosts(Posts,Comments,Users,Likes,Friends))
app.post('/getUserPosts',GetUserPosts(Posts))
app.post('/uploadProfilePicture',UploadProfilePicture(Users))
app.post('/addLike',AddLike(Likes,Posts))
app.post('/getUserByUsername', getUserByUsername(Users,Posts))
app.post('/addComment',addComment(Comments,Posts))
app.post('/addLikeToComment',AddLikeToComment(Comments,Posts))
app.post('/getAllMessages',GetAllMessages(MessagesScheme))

let users = []

wss.on('connection', (ws,req) => {
   
    const username = req.url.split('?')[1].split('=')[1];
    const newUser = {
        ws : ws,
        username : username
    }
    users.push(newUser)
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
        }else{
            const parsedMessage = await JSON.parse(message).message;
        
            const send = parsedMessage.send;
            const recipient = parsedMessage.recipient;
            const recipientName = parsedMessage.recipientName;
            const content = parsedMessage.content;
            const newMessage = parsedMessage.newMessage;
            await sendMessage(MessagesScheme,send,recipient,content)
            users.map((user) => {
                if(user.username === recipientName){
                    console.log(`Sending message to ${recipientName}`);
                    user.ws.send(JSON.stringify({ newMessage:newMessage }))
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