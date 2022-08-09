import "./style.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RoomAndUsers = ({ socket, username, room }) => {
	const [roomUsers, setRoomUsers] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		socket.on("chatroom_users", (data) => {
			setRoomUsers(data);
		});

		return () => socket.off("chatroom_users");
	}, [socket]);

	const leaveRoom = () => {
		const chatTime = Date.now();
		socket.emit("leave_room", { username, room, chatTime });
		navigate("/", { replace: true });
	};

	// console.log("UUUU  =>>>>> ", roomUsers);

	return (
		<div className="roomAndUsersColumn">
			<h4 className="roomTitle">Room : {room}</h4>

			<div>
				{roomUsers.length > 0 && (
					<h5 className="usersTitle">Users:</h5>
				)}
				<ul className="usersList">
					{roomUsers.map((user) => (
						<li
							style={{
								fontWeight: `${
									user.username === username
										? "bold"
										: "normal"
								}`,
							}}
							key={user.id}
						>
							{user.username}
						</li>
					))}
				</ul>
			</div>

			<button className="btn btn-outline" onClick={leaveRoom}>
				Leave
			</button>
		</div>
	);
};

export default RoomAndUsers;
