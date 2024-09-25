import { updateBoard } from "./uttt.js";

const host = window.location.hostname;
const port = window.location.port;
export const ws = new WebSocket(`ws://${host}:${port}`);

let client_events = [];

ws.onopen = () => console.log('Connected to server');
ws.onclose = () => console.log('Disconnected from server');

ws.onmessage = (event) => {
	let payload = {};
	try { payload = JSON.parse(event.data);}
	catch { console.error('Invalid JSON:', event.data); }

	if (payload.type === 'prepare_client') {
		client_events = payload.client_events;
		if (payload.board_size) updateBoard(payload.board_size, payload.board_state);
		return;
	}

	if (!client_events.includes(payload.type)) return;
	import(`./client_events/${payload.type}.js`)
		.then((event) => event.default(ws, payload));
};

document.getElementById("start").addEventListener("click", () => {
	ws.send(JSON.stringify({type: "start"}));
});