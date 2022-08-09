import "./style.css";
import { useState, useEffect, useRef } from "react";

const Messages = ({ socket }) => {
	const [messagesRecieved, setMessagesReceived] = useState([]);
	const messagesColumnRef = useRef(null);

	useEffect(() => {
		socket.on("receive_message", (data) => {
			setMessagesReceived((state) => [
				...state,
				{
					message: data.message,
					username: data.username,
					chatTime: data.chatTime,
				},
			]);
		});

		return () => socket.off("receive_message");
	}, [socket]);

	useEffect(() => {
		socket.on("last_100_messages", (last100Messages) => {
			// console.log("Last 100 messages:", JSON.parse(last100Messages));
			// last100Messages = last100Messages;
			last100Messages = sortMessagesByDate(last100Messages);
			setMessagesReceived((state) => [...last100Messages, ...state]);
		});

		return () => socket.off("last_100_messages");
	}, [socket]);

	useEffect(() => {
		messagesColumnRef.current.scrollTop = messagesColumnRef.current.scrollHeight;
	}, [messagesRecieved]);

	function sortMessagesByDate(messages) {
		return messages.sort(
			(a, b) => parseInt(a.chatTime) - parseInt(b.chatTime)
		);
	}

	function formatDateFromTimestamp(timestamp) {
		const date = new Date(timestamp);
		return date.toLocaleString();
	}

	return (
		// Add ref to this div
		<div className="messagesColumn" ref={messagesColumnRef}>
			{messagesRecieved.map((msg, i) => (
				<div className="message" key={i}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<span className="msgMeta">{msg.username}</span>
						<span className="msgMeta">
							{formatDateFromTimestamp(msg.chatTime)}
						</span>
					</div>
					<p className="msgText">{msg.message}</p>
					<br />
				</div>
			))}
		</div>
	);
};

export default Messages;
