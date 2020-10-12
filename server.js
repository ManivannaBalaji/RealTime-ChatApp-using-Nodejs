const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./utils/users");

const app = express();
const PORT = 3000 || process.env.PORT;
const server = http.createServer(app);
const io = socketio(server);

const appname = 'InstaChat';

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket =>{
    socket.on('joinRoom', ({username, room}) => {
        //joining user to room
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        //welcome current user
        socket.emit('message', formatMessage(appname, 'Welcome to InstaChat'));
        //broadcast when a user joins the chat
        socket.broadcast.to(user.room).emit('message', formatMessage(appname, `${user.username} has joined the chat`));
        //show current online users
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    
    //listen to chat messages
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //broadcast when a user exits the chat
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(appname, `${user.username} has left the chat`));
            //show current room users after a user exits
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

server.listen(PORT, () => console.log(`App is running on port ${PORT}`));