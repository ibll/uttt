import server from './events/outgoing.js';
import status from './scripts/status.js'
import Cookie from './modules/js.cookie.mjs';

const host = window.location.hostname;
const port = window.location.port;

let client_events = [];
let client_events_path = '';
let ws_opened = false;

export let connection_id = Cookie.get('connection_id');
export function setConnectionID(new_connection_id) {
	connection_id = new_connection_id;
}

export let ws;

document.addEventListener("DOMContentLoaded", function() {
	adjustTitleText()
	status.display("Connecting to server...");
	connect();
	setInterval(tryConnect, 5000);
});

document.getElementById("start").addEventListener("click", () => {
	const size_selector = document.getElementById("size-selector");
	server.start(size_selector.value);
});

window.addEventListener('resize', function() {
	adjustTitleText();
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

		if (payload.type === 'prepare_client') {
			client_events = payload.client_events;
			client_events_path = payload.client_events_path;

			console.log('Client being prepared...')

			let game_id = window.location.hash.substring(1);
			if (game_id) server.join(game_id);

			return
		}

		if (!client_events.includes(payload.type)) return;

		import(`${client_events_path}/${payload.type}.js`).then((event) => {
			event.default(ws, payload)
		});
	};
}

function tryConnect(){
	if(!ws || ws.readyState === WebSocket.CLOSED) {
		status.display("Trying to reconnect to server...", Infinity)
		connect();
	}
}

export function adjustTitleText() {
	const titleText = document.getElementById('title-text');

	if (titleText.offsetWidth < 240) titleText.textContent = 'UTTT';
	else if (titleText.offsetWidth < 360) titleText.textContent = 'Ultimate TTT';
	else titleText.textContent = 'Ultimate Tic-Tac-Toe';
}