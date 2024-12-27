import server from './events/outgoing.js';
import status from './scripts/toast.js'
import Cookie from './modules/js.cookie.mjs';
import {game_id, statusBarSetGameInfo} from "./scripts/uttt.js";
import status_bar from "./scripts/status_bar.js";
import Cookies from "./modules/js.cookie.mjs";

const host = window.location.hostname;
const port = window.location.port;

let client_events = [];
let client_events_path = '';

export let ws;
let ws_opened = false;
let attempts = 0;
let interval;

export let prepared = false;

export let connection_id = Cookie.get('connection_id');
export function setConnectionID(new_connection_id) {
	connection_id = new_connection_id;
}

document.addEventListener("DOMContentLoaded", function() {
	adjustTitleText();

	statusBarSetMyLinks();

	status.display("Connecting to server...");
	connect();
	interval = setInterval(tryConnect, 1000);
});

// Websocket

window.addEventListener('popstate', function() {
	const urlParams = new URLSearchParams(window.location.search);
	const param_id = urlParams.get('room');

	if (game_id && param_id) {
		window.location.reload();
	}
	if (!param_id) return;
	if (game_id && param_id !== game_id ) server.join(param_id);
});

function connect() {
	if (location.protocol === 'https:') ws = new WebSocket(`wss://${host}:${port}`);
	else if (location.protocol === 'http:') ws = new WebSocket(`ws://${host}:${port}`);

	ws.onopen = () => {
		status.display("Connected to server!");
		ws_opened = true;
	}
	ws.onclose = () => {
		if (ws_opened) status.display("Disconnected from server!", 5000);
		ws_opened = false;
		prepared = false;
	}

	ws.onmessage = async (event) => {
		let payload = {};
		try {
			payload = JSON.parse(event.data);
		} catch {
			console.error('Invalid JSON:', event.data);
		}

		if (payload.type === 'prepare_client') {
			client_events = payload.client_events;
			client_events_path = payload.client_events_path;

			Cookies.set('connection_id', payload.connection_id, {expires: 7});
			setConnectionID(payload.connection_id);
			console.log('Connecting with id ', payload.connection_id)

			const urlParams = new URLSearchParams(window.location.search);
			let game_id = urlParams.get('room')
			if (game_id) server.join(game_id, true);

			prepared = true;
			server.process_message_queue();

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
		if (attempts > 10) {
			clearInterval(interval);
			interval = setInterval(tryConnect, 10000);
		}
		attempts++;

		status.display("Trying to reconnect to server...", Infinity)
		connect();

	} else if (attempts > 0) {
		clearInterval(interval);
		interval = setInterval(tryConnect, 1000);
	}
}

// Elements

const title_text = document.getElementById('title-text');
const join_code_input = document.getElementById('join-code');
const join_button = document.getElementById('join');
const start_button = document.getElementById('start');
const leave_button = document.getElementById("leave");

// Resize Observers

const titleTextResizeObserver = new ResizeObserver(adjustTitleText);
titleTextResizeObserver.observe(title_text);

export function adjustTitleText() {
	const titleText = document.getElementById('title-text');

	if (titleText.offsetWidth < 220) titleText.textContent = 'UTTT';
	else if (titleText.offsetWidth < 360) titleText.textContent = 'Ultimate TTT';
	else titleText.textContent = 'Ultimate Tic-Tac-Toe';
}
const startButtonResizeObserver = new ResizeObserver(adjustStartButton);
startButtonResizeObserver.observe(start_button);

export function adjustStartButton() {
	if (start_button.classList.contains('enabled')) return;
	if (start_button.offsetWidth < 120) start_button.textContent = 'New...';
	else start_button.textContent = 'New Room...';
}

// Buttons

join_code_input.addEventListener("keyup", (event) => {
	if (event.key === 'Enter') join_button.click();
});

join_button.addEventListener("click", () => {
	const code = join_code_input.value;
	if (!code) return;
	server.join(code);
});

start_button.addEventListener("click", () => {
	if (!start_button.classList.contains('enabled')) {
		start_button.textContent = 'Cancel';
		start_button.classList.add('enabled');

		statusBarSetChooseSize();
	} else {
		resetStartButton()
		if (game_id) statusBarSetGameInfo();
		else statusBarSetMyLinks();
	}
});

leave_button.addEventListener("click", () => {
	window.location.href = '/';
});

export function resetStartButton() {
	start_button.textContent = 'New Room...';
	start_button.classList.remove('enabled');
}

export function addLeaveButton() {
	const leaveButton = document.getElementById('leave');
	if (leaveButton) leaveButton.classList.remove('hidden')

	const startButton = document.getElementById('start');
	if (startButton) startButton.classList.remove('right')
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
	status_bar.addBlock('', 'ultimate', '2 layers', server.start, 2);
	status_bar.addBlock('', 'nightmare', '3 layers', server.start, 3);
	status_bar.addBlock('', 'endless', 'good luck', server.start, 0);
}