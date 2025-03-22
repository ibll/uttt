import server from './events/outgoing.js';
import status from './scripts/toast.js'
import Cookies from './modules/js.cookie.mjs';
import {game_id, statusBarSetGameInfo, updateState} from "./scripts/uttt.js";
import status_bar from "./scripts/status_bar.js";
import {icons} from "./assets/icons.js";

const host = window.location.hostname;
const port = window.location.port;

let client_events = [];
let client_events_path = '';

export let ws;
let ws_opened = false;
let attempts = 0;
let interval;

export let prepared = false;

export let connection_id = Cookies.get('connection_id');

export function setConnectionID(new_connection_id) {
	connection_id = new_connection_id;
}

document.addEventListener("DOMContentLoaded", function () {
	adjustTitleText();
	statusBarSetMyLinks();
	resetPieceMarker();

	connect();
	interval = setInterval(tryConnect, 1000);
});

window.addEventListener('popstate', function () {
	let url = new URL(window.location);
	const url_params = new URLSearchParams(url.search);

	const param_id = url_params.get('room');

	if (!param_id) {
		updateState();
	} else if (param_id !== game_id) {
		server.join(param_id, true);
	}
});

// Websocket

function connect() {
	if (location.protocol === 'https:') ws = new WebSocket(`wss://${host}:${port}`);
	else if (location.protocol === 'http:') ws = new WebSocket(`ws://${host}:${port}`);

	ws.onopen = () => {
		if (attempts > 0) status.display("Connected to server!");
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

function tryConnect() {
	if (!ws || ws.readyState === WebSocket.CLOSED) {
		console.log(attempts);
		if (attempts > 10) {
			clearInterval(interval);
			interval = setInterval(tryConnect, 10000);
		}
		attempts++;

		status.display("Trying to reconnect to server...", Infinity)
		connect();

	} else if (attempts > 0) {
		attempts = 0;
		clearInterval(interval);
		interval = setInterval(tryConnect, 1000);
	}
}

// Elements

export const tutorial_dialog = document.getElementById('tutorial-dialog');
export const brief_tutorial = document.getElementById('brief-tutorial');
export const how_to_play = document.getElementById('how-to-play');
const brief_tutorial_dismiss = document.getElementById('brief-tutorial-dismiss');
const show_tutorial = document.getElementById('show-tutorial');
const title_box = document.getElementById('title-box');
const title_text = document.getElementById('title-text');
const join_code_input = document.getElementById('join-code');
const join_button = document.getElementById('join');
const start_button = document.getElementById('start');
const leave_button = document.getElementById("leave");
const piece_marker = document.getElementById("piece-marker");

// Resize Observers

const titleTextResizeObserver = new ResizeObserver(adjustTitleText);
titleTextResizeObserver.observe(title_text);

export function adjustTitleText() {
	const title_text = document.getElementById('title-text');

	if (title_text.offsetWidth < 220) title_text.textContent = 'UTTT';
	else if (title_text.offsetWidth < 360) title_text.textContent = 'Ultimate TTT';
	else title_text.textContent = 'Ultimate Tic-Tac-Toe';
}

const startButtonResizeObserver = new ResizeObserver(adjustStartButton);
startButtonResizeObserver.observe(start_button);

export function adjustStartButton() {
	if (start_button.classList.contains('enabled')) return;
	if (start_button.offsetWidth < 120) start_button.textContent = 'New...';
	else start_button.textContent = 'New Room...';
}

// Modal close

tutorial_dialog.addEventListener('pointerdown', function (event) {
	// If the clicked element is the modal overlay (and not the inner modal content)
	if (event.target === tutorial_dialog) {
		tutorial_dialog.close()
	}
});

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
	updateState();
});

brief_tutorial_dismiss.addEventListener("click", () => {
	tutorial_dialog.close();
});

title_box.addEventListener("click", () => {
	showBriefTutorial();
})

show_tutorial.addEventListener("click", () => {
	showBriefTutorial();
});

// Game button handlers

export function resetStartButton() {
	start_button.textContent = 'New Room...';
	start_button.classList.remove('enabled');
}

export function addLeaveButton() {
	if (leave_button) leave_button.classList.remove('hidden');
	if (start_button) start_button.classList.remove('right');
}

export function removeLeaveButton() {
	if (leave_button) leave_button.classList.add('hidden');
	if (start_button) start_button.classList.add('right');
}

// UI controls

export function statusBarSetMyLinks() {
	status_bar.reset();
	status_bar.addBlock('', 'my site', `<a href="https://ibll.dev/">ibll.dev</a>`)
	status_bar.addBlock('made-by', 'made by', `Isbell!`)
	status_bar.addBlock('', 'github', `<a href="https://github.com/ibll/uttt/">ibll/uttt</a>`)
}

function statusBarSetChooseSize() {
	status_bar.reset();
	status_bar.setActive(true);
	status_bar.addBlock('', 'ultimate', '2 layers', server.start, 2);
	status_bar.addBlock('', 'nightmare', '3 layers', server.start, 3);
	status_bar.addBlock('', 'endless', 'good luck', server.start, 0);
}

export function resetPieceMarker() {
	piece_marker.innerHTML = icons.heart;
}

export function showBriefTutorial() {
	Cookies.set("tutorial-shown", true, {expires: 365});
	tutorial_dialog.showModal();
	brief_tutorial.scrollTo(0, 0);
}
