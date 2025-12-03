// socket.js
import { io } from "socket.io-client";


const Socket = io(process.env.REACT_APP_API_URL, {
	transports: ["websocket"], 
	path: "/socket.io",
	withCredentials: true,
	secure: true,
	reconnectionAttempts: 5,
});

Socket.on("connect_error", (err) => {
	console.error("Socket connect_error:", err.message || err);
});

export default Socket;
