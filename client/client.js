import server from './events/outgoing.js';
import status from './scripts/status.js'
import Cookie from './modules/js.cookie.mjs';
import {game_id} from "./scripts/uttt.js";

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
	adjustTitleText();
	resetStatusBar();
	addStatusBarBlock('', 'my site', `<a href="https://ibll.dev/">ibll.dev</a>`)
	addStatusBarBlock('', 'made by', `Isbell!`)
	addStatusBarBlock('', 'github', `<a href="https://github.com/ibll/uttt/">ibll/uttt</a>`)

	status.display("Connecting to server...");
	connect();
	setInterval(tryConnect, 5000);
});

document.getElementById("start").addEventListener("click", () => {
	server.start(2);
});

document.getElementById("leave").addEventListener("click", () => {
	window.location.href = '/';
});

window.addEventListener('resize', function() {
	adjustTitleText();
});

window.addEventListener('hashchange', function() {
	if (!window.location.hash) return;
	const hash = window.location.hash.substring(1);
	if (hash && hash !== game_id ) server.join(hash);
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

export function addLeaveButton() {
	const leaveButton = document.getElementById('leave');
	if (leaveButton) leaveButton.classList.remove('hidden')

	const startButton = document.getElementById('start');
	if (startButton) startButton.classList.remove('button-right')
}

export function resetStatusBar() {
	const status_bar = document.getElementById('status-bar');
	status_bar.innerHTML = '';
}

export function addStatusBarBlock(id, label, value) {
	const status_bar = document.getElementById('status-bar');
	const status_block = document.createElement('div');

	status_block.id = id;
	status_block.classList.add('status-block');

	status_block.innerHTML = `
		<p class="status-label">${label}</p>
		<p class="status-value">${value}</p>
	`;

	status_bar.appendChild(status_block);
	return status_bar;
}


export function updateStatusBlock(id, value) {
	const element = document.getElementById(id);
	if (!element) return;
	const valueElement = element.querySelector('.status-value');
	if (!valueElement) return;
	valueElement.textContent = value;
}