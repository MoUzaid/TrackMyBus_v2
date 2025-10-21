// socket.js
import { io } from "socket.io-client";

// Prefer websocket transport to avoid XHR polling CORS issues when the server
// and client are on different origins. Ensure REACT_APP_API_URL points to
// the deployed server (e.g. https://trackmybus-production-ae40.up.railway.app)
const Socket = io(process.env.REACT_APP_API_URL, {
	transports: ["websocket"], // force websocket (no polling)
	path: "/socket.io",
	withCredentials: true,
	secure: true,
	reconnectionAttempts: 5,
});

Socket.on("connect_error", (err) => {
	console.error("Socket connect_error:", err.message || err);
});

export default Socket;
