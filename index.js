require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const { loremIpsum } = require('lorem-ipsum');
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

    const MessageSchema = new mongoose.Schema(
        {
          name: String,
          message: String,
          chatroom: String,
        },
        { timestamps: true }
      );
      MessageSchema.set('timestamps', true);
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
const Names = ['Aarav', 'Ishaan', 'Aanya', 'Sanya', 'Rohan', 'Aaradhya', 'Ananya', 'Aryan', 'Aishwarya', 'Rahul'];

app.get('/initialize', async (req, res) => {
    try {
        const chatrooms = ['Politics', 'Cricket', 'Business'];

        // Generate and save 10 unique Lorem Ipsum messages for each chatroom
        for (const chatroom of chatrooms) {
            for (let i = 1; i <= 10; i++) {
                const username = generateName();
                const messageContent = generateLoremIpsum();
                const messageData = {
                    name: username,
                    message: messageContent,
                    chatroom: chatroom,
                };

                const message = new Message(messageData);
                await message.save();
            }
        }

        res.sendStatus(200);

app.get('/chatrooms', async (req, res) => {
    try {
        const chatrooms = await Message.distinct('chatroom');
        res.send(chatrooms);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Function to generate a random Indian name
function generateName() {
    const randomIndex = Math.floor(Math.random() * Names.length);
    return Names[randomIndex];
}

// Function to generate Lorem Ipsum text
function generateLoremIpsum() {
    return loremIpsum({
        count: 1,                      // Number of words, sentences, or paragraphs to generate.
        units: 'sentences',            // Generate words, sentences, or paragraphs.
        sentenceLowerBound: 5,         // Minimum words per sentence.
        sentenceUpperBound: 15,        // Maximum words per sentence.
        paragraphLowerBound: 3,        // Minimum sentences per paragraph.
        paragraphUpperBound: 7,        // Maximum sentences per paragraph.
        format: 'plain',               // Plain text or html
    });
}
app.use(express.static(__dirname));
