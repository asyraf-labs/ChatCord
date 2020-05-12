// This is a Back-end / our entry point to everything

const path = require('path'); // node js module
//regular express server
const http = require('http'); // use by express under the hood 
// method , createServer that express use it
const express = require('express');  //bring in express
// What is require ??
// https://stackoverflow.com/questions/9901082/what-is-this-javascript-require
const socketio = require('socket.io'); //bring in socket.io
const formatMessage = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/user');
const botName = 'ChatCord Bot';


const app = express();  // initialize an app variable and set to express
const server = http.createServer(app); // pass in our express app 
const io = socketio(server);


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));  // __dirname = curent directory | join with public folder

// Run when clients connect
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
        
        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord')); // to a single client

        // Broadcast when user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`)); // to all of the clients except the client that connecting

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });    

    /* console.log('New WS Connection....'); */ 
    
    //Listen for chatMessage
    socket.on('chatMessage', msg => {
        /* console.log(msg); */ //appear on the server
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg)); // appear the message to the client
        
    })
    
    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        
        if(user) {
            
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`)); 
            //if the user left the chat , a messahe will appear to everyone that he is left

            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });
    /* io.emit(); */ //to all of the client in general
}); // on : listen to event

const PORT = process.env.PORT || 3000 ; //environment variable call port

server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); //listen to a port number
/* app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); */ 
// listen ??
// https://www.w3schools.com/nodejs/met_server_listen.asp

//npm run dev