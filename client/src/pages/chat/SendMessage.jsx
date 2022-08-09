import "./style.css";
import React, { useState } from "react";

const SendMessage = ({ socket, username, room }) => {
	const [message, setMessage] = useState("");

	const sendMessage = () => {
		if (message !== "") {
			const chatTime = Date.now();
			socket.emit("send_message", {
				username,
				room,
				message,
				chatTime,
			});
			setMessage("");
		}
	};

	return (
		<div className="sendMessageContainer">
			<input
				className="messageInput"
				placeholder="Message..."
				onChange={(event) => setMessage(event.target.value)}
				value={message}
			/>
			<button className="btn btn-primary" onClick={sendMessage}>
				Send Message
			</button>
		</div>
	);
};

export default SendMessage;
