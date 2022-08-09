import "./style.css";
import { useNavigate } from "react-router-dom";

const Home = ({ username, setUsername, room, setRoom, socket }) => {
	const navigate = useNavigate();
	const joinRoom = () => {
		if (username !== "") {
			socket.emit("join_room", { username, room });
			navigate("/chat", { replace: true });
		} else {
			alert("Enter some value in username!");
			return;
		}
	};
	return (
		<>
			<div className="container">
				<div className="formContainer">
					<h1>{`Chat Rooms`}</h1>
					<input
						className="input"
						placeholder="Username..."
						onChange={(event) => setUsername(event.target.value)}
					/>
					<select
						className="input"
						onChange={(event) => setRoom(event.target.value)}
					>
						<option disabled>
							-- Select Room --
						</option>
						<option value="javascript">JavaScript</option>
						<option value="node">Node</option>
						<option value="express">Express</option>
						<option value="react">React</option>
					</select>

					<button className="btn btn-secondary" onClick={joinRoom}>
						Join Room
					</button>
				</div>
			</div>
		</>
	);
};

export default Home;
