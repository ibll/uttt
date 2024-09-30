import server from './client_events/outgoing.js';
import status from './scripts/status.js'
import Cookie from './modules/js.cookie.mjs';

const host = window.location.hostname;
const port = window.location.port;

let client_events = [];
let ws_opened = false;

export let connection_id = Cookie.get('connection_id');

export let ws;

document.addEventListener("DOMContentLoaded", function() {
	status.display("Connecting to server...");
	connect();
	setInterval(tryConnect, 5000);
});

function connect() {
	ws = new WebSocket(`ws://${host}:${port}`);

	ws.onopen = () => {
		status.display("Connected to server!");
		ws_opened = true;
	}
	ws.onclose = () => {
		if (ws_opened) status.display("Disconnected from server!", 5000);

		ws_opened = false;
	}

	ws.onmessage = (event) => {
		let payload = {};
		try { payload = JSON.parse(event.data);}
		catch { console.error('Invalid JSON:', event.data); }

		if (payload.type === 'prepare_client')
			return client_events = payload.client_events;

		if (!client_events.includes(payload.type)) return;

		import(`./client_events/incoming/${payload.type}.js`)
			.then((event) => event.default(ws, payload));
	};
}

function tryConnect(){
	if(!ws || ws.readyState === WebSocket.CLOSED) {
		status.display("Trying to reconnect to server...", Infinity)
		connect();
	}
}

document.getElementById("start").addEventListener("click", () => {
	server.start();
});