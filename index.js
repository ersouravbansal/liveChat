require('dotenv').config()
let express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const { loremIpsum } = require('lorem-ipsum');
const app = express();
const port = process.env.portNumber
const server = app.listen(port, () => {
    console.log("server is running on port", server.address().port);
});
const io = socketio(server)
io.on('connection', (socket) => {
    console.log('New connection Socket IO')
})
const db_url = process.env.MongodbURI
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

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// get: will get all the messages from the database
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find({});
        res.send(messages);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// post: will save new messages created by the user to the database
app.post('/messages', async (req, res) => {
    try {
        let message = new Message(req.body);
        await message.save();
        io.emit('message', req.body);
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