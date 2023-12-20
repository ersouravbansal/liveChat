require('dotenv').config()
let express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
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

const MessageSchema = new mongoose.Schema({
    name: String,
    message: String
});
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
app.use(express.static(__dirname));