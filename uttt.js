import {wss} from "./index.js";

const DEPTH = 2;

export let board_depth;
export let board_state = {};
export let active_grids;
let active_player = 0;
let players = [];

export function start() {
	board_depth = DEPTH;
	board_state = {};
	active_grids = undefined;
	active_player = 0;
	players = [];

	wss.clients.forEach(client => {
		client.send(JSON.stringify({ type: "start", depth: DEPTH }))
	});
}

export function place(cell_layer, cell_number, connection_id, force) {
	console.log(`${connection_id} requested to place at ${cell_layer}.${cell_number}`);

	if (!board_state[cell_layer]) board_state[cell_layer] = {};
	if (board_state[cell_layer][cell_number] !== undefined) return;

	if (active_grids && !force) {
		checkIfActive(cell_layer, cell_number);
	}

	// Join if empty slot
	if (players[0] === undefined) players[0] = connection_id;
	else if (players[1] === undefined && players[0] !== connection_id) players[1] = connection_id;

	if (connection_id !== players[active_player]) return;

	if (board_depth > 1) {
		const next_layer_size = Math.pow(9, cell_layer + 1);
		const parent_cell = Math.floor(cell_number / (next_layer_size))*9 + cell_number % 9;

		active_grids = {};

		if ((cell_layer + 1) <= board_depth) {
			if (!active_grids[cell_layer + 1]) active_grids[cell_layer + 1] = {};
			if (!board_state[cell_layer + 1]) board_state[cell_layer + 1] = {};
			if (board_state[cell_layer + 1][parent_cell] === undefined) {
				active_grids[cell_layer + 1][parent_cell] = true;
			} else {
				if (!active_grids[cell_layer + 2]) active_grids[cell_layer + 2] = {};
				active_grids[cell_layer + 2][Math.floor(parent_cell / 9)] = true;
			}

			wss.clients.forEach(client => {
				client.send(JSON.stringify({ type: "set_active_grids", active_grids }))
			});
		} else {
			active_grids = undefined;
		}
	}

	board_state[cell_layer][cell_number] = active_player;
	console.log(`${active_player} placed at ${cell_number}`);

	const grid = Math.floor(cell_number / 9);
	const winner = checkWhoWonGrid(cell_layer + 1, grid);
	if (winner !== null) {
		console.log(`${winner} won grid ${cell_layer + 1}.${grid}!`);
		place(cell_layer + 1, grid, players[winner], true);
	} else {
		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "place", layer: cell_layer, cell_num: cell_number, player: active_player }));
		});
	}

	if (!force) {
		active_player++;
		active_player %= 2;

	}
}

function checkIfActive(cell_layer, cell_number) {
	// check recursively up by one each time
	if (!active_grids) active_grids = {};
	if (!active_grids[cell_layer + 1]) active_grids[cell_layer + 1] = {};

	if (active_grids[cell_layer + 1][Math.floor(cell_number / 9)] === true) return true;

	if (cell_layer < board_depth) {
		const next_layer_size = Math.pow(9, cell_layer + 1);
		const parent_cell = Math.floor(cell_number / (next_layer_size))*9 + cell_number % 9;
		return checkIfActive(cell_layer + 1, parent_cell);
	}
}

function checkWhoWonGrid(grid_layer, grid_number) {
	const cell_layer = grid_layer - 1;
	const first_cell_number = grid_number * 9;

	for (let row = 0; row < 3; row++) {
		const c0 = board_state[cell_layer]?.[first_cell_number + row*3];
		const c1 = board_state[cell_layer]?.[first_cell_number + row*3 + 1];
		const c2 = board_state[cell_layer]?.[first_cell_number + row*3 + 2];
		if (c0 === c1 && c1 === c2 && c0 !== undefined) return c0;
	}

	for (let col = 0; col < 3; col++) {
		const c0 = board_state[cell_layer]?.[first_cell_number + col];
		const c1 = board_state[cell_layer]?.[first_cell_number + col + 3];
		const c2 = board_state[cell_layer]?.[first_cell_number + col + 6];
		if (c0 === c1 && c1 === c2 && c0 !== undefined) return c0;
	}

	const c0 = board_state[cell_layer]?.[first_cell_number];
	const c1 = board_state[cell_layer]?.[first_cell_number + 4];
	const c2 = board_state[cell_layer]?.[first_cell_number + 8];
	if (c0 === c1 && c1 === c2 && c0 !== undefined) return c0;

	const c3 = board_state[cell_layer]?.[first_cell_number + 2];
	const c4 = board_state[cell_layer]?.[first_cell_number + 4];
	const c5 = board_state[cell_layer]?.[first_cell_number + 6];
	if (c3 === c4 && c4 === c5 && c3 !== undefined) return c3;

	return null;
}