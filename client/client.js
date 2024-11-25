import server from './events/outgoing.js';
import status from './scripts/toast.js'
import Cookie from './modules/js.cookie.mjs';
import {game_id, statusBarSetGameInfo} from "./scripts/uttt.js";
import status_bar from "./scripts/status_bar.js";

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

	statusBarSetMyLinks();

	status.display("Connecting to server...");
	connect();
	setInterval(tryConnect, 5000);
});

const start_element = document.getElementById('start')
start_element.addEventListener("click", () => {
	if (!start_element.classList.contains('enabled')) {
		start_element.textContent = 'Cancel';
		start_element.classList.add('enabled');

		statusBarSetChooseSize();
	} else {
		resetStartButton()
		if (game_id) statusBarSetGameInfo();
		else statusBarSetMyLinks();
	}
});

document.getElementById("leave").addEventListener("click", () => {
	window.location.href = '/';
});

// window.addEventListener('resize', adjustTitleText);
const titleText = document.getElementById('title-text');

const resizeObserver = new ResizeObserver(adjustTitleText);
resizeObserver.observe(titleText);


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

export function resetStartButton() {
	const startButton = document.getElementById('start');
	startButton.textContent = 'New Room...';
	startButton.classList.remove('enabled');
}

export function addLeaveButton() {
	const leaveButton = document.getElementById('leave');
	if (leaveButton) leaveButton.classList.remove('hidden')

	const startButton = document.getElementById('start');
	if (startButton) startButton.classList.remove('button-right')
}

function statusBarSetMyLinks() {
	status_bar.reset();
	status_bar.addBlock('', 'my site', `<a href="https://ibll.dev/">ibll.dev</a>`)
	status_bar.addBlock('', 'made by', `Isbell!`)
	status_bar.addBlock('', 'github', `<a href="https://github.com/ibll/uttt/">ibll/uttt</a>`)
}

function statusBarSetChooseSize() {
	status_bar.reset();
	status_bar.setActive(true);
	status_bar.addBlock('', 'classic', '1 layer', server.start, 1);
	status_bar.addBlock('', 'ultimate', '2 layers', server.start, 2);
	status_bar.addBlock('', 'nightmare', '3 layers', server.start, 3);
}
