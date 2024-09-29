import {wss} from "./index.js";

const DEPTH = 1;

export let board_depth;
export let board_state = {};
export let active_grids;
let active_player = 0;
let players = [];

export function start() {
	board_depth = DEPTH;
	board_state = {};
	active_grids = {};
	active_player = 0;
	players = [];

	if (!active_grids[board_depth]) active_grids[board_depth] = {};
	active_grids[board_depth][0] = true;

	wss.clients.forEach(client => {
		client.send(JSON.stringify({ type: "update_state", board_depth, board_state, active_grids }));
	});
}

export function place(cell_layer, cell_number, connection_id, previous_cells) {
	const cell_layer_size = Math.pow(9, board_depth - cell_layer)
	const grid_layer = cell_layer + 1;
	const grid_number = Math.floor(cell_number / 9);
	const pos_in_grid = cell_number % 9;

	// Ensure cell is within bounds
	if (cell_number < 0 || cell_number >= cell_layer_size)
		return console.error(`Cell ${cell_layer}.${cell_number} is out of bounds for layer ${cell_layer}`);

	// Ensure cell is not already filled
	if (board_state[cell_layer]?.[cell_number] !== undefined)
		return console.error(`Cell ${cell_layer}.${cell_number} is already filled`);

	// Ensure cell is active
	if (!previous_cells && !isCellActive(cell_layer, cell_number))
		return console.error(`Cell ${cell_layer}.${cell_number} is not active`);

	// Assign players on the first two turns
	if (players[active_player] === undefined)
		players[active_player] = connection_id;

	// Ensure only the allowed player is placing
	if (connection_id !== players[active_player]) {
		return console.error(`It is not ${active_player === 0 ? 'X' : 'O'}'s turn to place`);
	}

	// Place the piece
	if (!board_state[cell_layer]) board_state[cell_layer] = {};
	board_state[cell_layer][cell_number] = active_player;
	console.log(`${active_player === 0 ? 'X' : 'O'} placed at ${cell_layer}.${cell_number}`);
	wss.clients.forEach(client => {
		client.send(JSON.stringify({ type: "place", cell_layer, cell_number, player: active_player }));
	});

	// Win the grid if necessary
	if (checkWhoWonGrid(grid_layer, grid_number) !== null) {
		console.log(`${active_player === 0 ? 'X' : 'O'} won grid ${cell_layer}.${cell_number}!`);

		if (!previous_cells) previous_cells = {};
		previous_cells[cell_layer] = cell_number % 9;
		place(grid_layer, grid_number, players[active_player], previous_cells);

	}

	if (grid_layer < board_depth)
		setNextActiveGrid(grid_layer + 1, Math.floor(grid_number / 9), pos_in_grid, previous_cells);

	// Switch active player
	if (!previous_cells)
		active_player = 1 - active_player;

}

function setNextActiveGrid(grid_layer, grid_number, pos_in_grid, previous_cells) {
	console.log(`grid_layer: ${grid_layer}, grid_number: ${grid_number}, pos_in_grid: ${pos_in_grid}`);

	const cell_layer = grid_layer - 1;
	const cell_number = grid_number * 9;

	active_grids = {};
	if (!active_grids[cell_layer]) active_grids[cell_layer] = {};

	let next_number = cell_number  + pos_in_grid;

	if (board_state[cell_layer]?.[next_number] === undefined) {
		active_grids[cell_layer][next_number] = true;
		wss.clients.forEach(client => {
			client.send(JSON.stringify({ type: "set_active_grids", active_grids }));
		});

		if (previous_cells?.[cell_layer - 2] !== undefined && cell_layer > 1)
			setNextActiveGrid(cell_layer, next_number, previous_cells[cell_layer - 2], previous_cells);
	} else {
		setNextActiveGrid(grid_layer + 1, Math.floor(next_number / 9), next_number % 9);
	}

}

function isCellActive(cell_layer, cell_number) {
	const grid_layer = cell_layer + 1;
	const grid_number = Math.floor(cell_number / 9);

	// Cell isn't active if we've checked past the outermost grid.
	if (cell_layer >= board_depth + 2) {
		// console.log(`Cell ${cell_layer} is outside the board of size ${board_depth}, so the cell is not active.`);
		return false;
	}
	// Check if grid is active directly.
	if (active_grids[cell_layer] && active_grids[cell_layer][cell_number]) {
		// console.log(`Cell ${cell_layer}.${cell_number} is active.`);
		return true;
	}

	// Check if the grid the cell is in is active.
	// console.log(`The cell ${cell_layer}.${cell_number} itself is not active, checking if the above grid ${grid_layer}.${grid_number} is active.`);
	return isCellActive(grid_layer, grid_number);
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