import {wss} from "./index.js";

const DEPTH = 2;

export let board_size = 0;
export let board_state = {};
let active_cells;
let active_player = 0;
let players = [];

export function start() {
	board_size = DEPTH;
	board_state = {};
	active_player = 0;
	players = [];

	wss.clients.forEach(client => {
		client.send(JSON.stringify({ type: "start", depth: DEPTH }))
	});
}

export function place(cell_id, connection_id) {
	const cell_num = cell_id.split('.')[2];
	if (!board_state[1]) board_state[1] = {};
	if (board_state[1][cell_num] !== undefined) return;

	if (active_cells) {
		if (!active_cells) active_cells = {};
		if (!active_cells[1 + 1]) active_cells[1 + 1] = {};

		if (active_cells[1 + 1][Math.floor(cell_num / 9)] !== true) return;
	}

	// Join if empty slot
	if (players[0] === undefined) players[0] = connection_id;
	else if (players[1] === undefined && players[0] !== connection_id) players[1] = connection_id;

	if (connection_id !== players[active_player]) return;

	if (board_size > 1) {
		const parent_cell = cell_num % 9
		active_cells = {};
		if (!active_cells[1 + 1]) active_cells[1 + 1] = {};
		active_cells[1 + 1][parent_cell] = true;

		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "set_active", active_cells }))
		});
	}

	board_state[1][cell_num] = active_player;
	console.log(`${active_player} placed at ${cell_num}`);

	wss.clients.forEach(client => {
		client.send(JSON.stringify({ type: "place", cell_num, player: active_player }));
	});

	active_player++;
	active_player %= 2;
}