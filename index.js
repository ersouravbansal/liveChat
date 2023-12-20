require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const app = express();
const port = process.env.portNumber;
const server = app.listen(port, () => {
    console.log("server is running on port", server.address().port);
});
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('New connection Socket IO');

    // Handle joining a chatroom
    socket.on('join', (chatroom) => {
      socket.join(chatroom);
      console.log(`Socket ${socket.id} joined chatroom ${chatroom}`);
    });

    // Handle creating a new chatroom
    socket.on('createRoom', (newRoomName) => {
      // You can add logic to save the new room to the database if needed.
      console.log(`New chatroom created: ${newRoomName}`);
      
      // Broadcast the new room to all connected clients
      io.emit('newRoom', newRoomName);
    });
});

const db_url = process.env.MongodbURI;
mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("db connection successful");
    })
    .catch((err) => {
        console.log("db connection failed", err);
    });

const MessageSchema = new mongoose.Schema({
    name: String,
    message: String,
    chatroom: String,
});

const Message = mongoose.model('Message', MessageSchema);

app.use(express.static(__dirname));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/messages/:chatroom', async (req, res) => {
    try {
        const messages = await Message.find({ chatroom: req.params.chatroom });
        res.send(messages);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/messages', async (req, res) => {
    try {
        let message = new Message(req.body);
        await message.save();
        io.to(req.body.chatroom).emit('message', req.body);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get('/chatrooms', async (req, res) => {
    try {
        const chatrooms = await Message.distinct('chatroom');
        res.send(chatrooms);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
