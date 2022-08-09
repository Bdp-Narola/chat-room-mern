require('dotenv').config();
// console.log(process.env.MONGO_CLIENT);
const CHAT_BOT = 'ChatBot';

const leaveRoom = require('./utils/leaveRoom');

// Dependencies
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const {
	Server
} = require('socket.io');

app.use(cors());

// SCOKET SERVER
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST'],
	},
});

// MONGO client
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = "mongodb://localhost:27017?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
var dbObject;

MongoClient.connect(mongoUrl, {
	useNewUrlParser: true,
	useunifiedtopology: true
}).then(client => {
	dbObject = client.db("chat_room");
});
let chatRoom = '';

let allUsers = [];
// SOCKET EMIT CODE
io.on('connection', (socket) => {
	console.log(`User connected ${socket.id}`);

	socket.on('join_room', async (data) => {
		const {
			username,
			room
		} = data;
		socket.join(room);

		let findUser = await dbObject.collection("room_users").findOne({
			"username": username,
			"room": room
		}).then(result => {
			if (result === null) {
				dbObject.collection("room_users").insertOne({
						"username": username,
						"room": room
					})
					.then(result => {
						console.log("INSERT RESULT =>  ", result);
					})
					.catch(error => console.error(error));
			} else {
				dbObject.collection("room_users").updateOne({
						"username": result.username,
						"room": room
					}, {
						$set: {
							room: room
						}
					})
					.then(result => {
						console.log("UPDATE RESULT =>  ", result);
					})
					.catch(error => console.error(error));
			}
		});



		let lastHundresMessages = await dbObject.collection("messages").find({
				"room": room
			})
			.toArray().then((last100Messages) => {
				socket.emit('last_100_messages', last100Messages);
			})
			.catch((err) => console.log(err));



		let chatTime = Date.now();
		// Send message to all users currently in the room, apart from the user that just joined
		socket.to(room).emit('receive_message', {
			message: `${username} has joined the chat room`,
			username: CHAT_BOT,
			chatTime,
		});

		socket.emit('receive_message', {
			message: `Welcome ${username}`,
			username: CHAT_BOT,
			chatTime,
		});





		chatRoom = room;
		allUsers.push({
			id: socket.id,
			username,
			room
		});
		chatRoomUsers = allUsers.filter((user) => user.room === room);
		socket.to(room).emit('chatroom_users', chatRoomUsers);
		socket.emit('chatroom_users', chatRoomUsers);
	});


	socket.on('send_message', async (data) => {
		const {
			message,
			username,
			room,
			chatTime
		} = data;
		io.in(room).emit('receive_message', data); // Send to all users in room, including sender

		dbObject.collection("messages").insertOne({
				message,
				username,
				room,
				chatTime
			})
			.then(result => {
				console.log("INSERT RESULT =>  ", result);
			})
			.catch(error => console.error(error));
	});



	socket.on('leave_room', (data) => {
		const {
			username,
			room
		} = data;
		socket.leave(room);
		const chatTime = Date.now();
		// Remove user from memory
		allUsers = leaveRoom(socket.id, allUsers);
		socket.to(room).emit('chatroom_users', allUsers);
		socket.to(room).emit('receive_message', {
			username: CHAT_BOT,
			message: `${username} has left the chat`,
			chatTime,
		});
		console.log(`${username} has left the chat`);
	});



	socket.on('disconnect', () => {
		console.log('User disconnected from the chat');
		const user = allUsers.find((user) => user.id == socket.id);
		if (user?.username) {
			allUsers = leaveRoom(socket.id, allUsers);
			socket.to(chatRoom).emit('chatroom_users', allUsers);
			socket.to(chatRoom).emit('receive_message', {
				message: `${user.username} has disconnected from the chat.`,
			});
		}
	});




});


server.listen(4000, () => 'Server is running on port 4000');
