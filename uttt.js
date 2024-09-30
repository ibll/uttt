import clients from './server_events/outgoing.js';

const DEPTH = 3;

export let board_depth;
export let board_state;
export let active_grids;
let active_player;
let players = [];

export function start() {
	board_depth = DEPTH;
	board_state = {};
	active_grids = {};
	active_player = 0;
	players = [];

	if (!active_grids[board_depth]) active_grids[board_depth] = {};
	active_grids[board_depth][0] = true;
	clients.updateState(board_depth, board_state, active_grids);
}

export function place(cell_layer, cell_number, connection_id, previous_cells) {
	const cell_layer_size = Math.pow(9, board_depth - cell_layer)
	const grid_layer = cell_layer + 1;
	const grid_number = Math.floor(cell_number / 9);
	const pos_in_grid = cell_number % 9;

	// Ensure game is running
	if (board_depth === undefined)
		return console.error('Game has not been started');

	// Ensure cell is within bounds
	if (cell_number < 0 || cell_number >= cell_layer_size)
		return console.error(`Cell ${cell_layer}.${cell_number} is out of bounds for layer ${cell_layer}`);

	// Ensure cell is not already filled
	if (board_state[cell_layer]?.[cell_number] !== undefined)
		return console.error(`Cell ${cell_layer}.${cell_number} is already filled`);

	for (let i = 0; i < board_depth; i++) {
		const grid_number = Math.floor(cell_number / Math.pow(9, i));
		if (board_state[i]?.[grid_number] !== undefined)
			return console.error(`Cell ${cell_layer}.${cell_number} is within a filled grid`);
	}

	// Ensure cell is active
	if (!previous_cells && !isCellActive(cell_layer, cell_number))
		return console.error(`Cell ${cell_layer}.${cell_number} is not active`);

	// Assign players on the first two turns
	if (players[active_player] === undefined)
		players[active_player] = connection_id;

	// Ensure only the allowed player is placing
	if (connection_id !== players[active_player])
		return console.error(`It is not ${active_player === 0 ? 'X' : 'O'}'s turn to place`);

	// Place the piece
	if (!board_state[cell_layer]) board_state[cell_layer] = {};
	board_state[cell_layer][cell_number] = active_player;
	console.log(`${active_player === 0 ? 'X' : 'O'} placed at ${cell_layer}.${cell_number}`);
	clients.place(cell_layer, cell_number, active_player);

	// Set next active grid
	if (grid_layer < board_depth) {
		findNextActiveGrid(grid_layer + 1, Math.floor(grid_number / 9), pos_in_grid, previous_cells);
	}

	// Win the grid if necessary
	const winner = checkWhoWonGrid(grid_layer, grid_number);
	if (winner != null) {
		console.log(`${active_player === 0 ? 'X' : 'O'} won grid ${grid_layer}.${grid_number}!`);

		if (!previous_cells) previous_cells = {};
		previous_cells[cell_layer] = cell_number % 9;
		place(grid_layer, grid_number, players[active_player], previous_cells);
	}

	// Switch active player
	if (cell_layer === 0)
		active_player = 1 - active_player;
		clients.setActiveGrid(active_grids, players[active_player]);

}

function findNextActiveGrid(grid_layer, grid_number, pos_in_grid, previous_cells) {
	const cell_layer = grid_layer - 1;
	const cell_number = grid_number * 9;
	const next_number = cell_number  + pos_in_grid;

	active_grids = {};
	if (!active_grids[cell_layer]) active_grids[cell_layer] = {};

	if (board_state[cell_layer]?.[next_number] === undefined) {
		active_grids[cell_layer][next_number] = true;

		if (previous_cells?.[cell_layer - 2] !== undefined && cell_layer > 1)
			return findNextActiveGrid(cell_layer, next_number, previous_cells[cell_layer - 2], previous_cells);
	} else {
		return findNextActiveGrid(grid_layer + 1, Math.floor(grid_number / 9), grid_number % 9);
	}
}

function isCellActive(cell_layer, cell_number) {
	const grid_layer = cell_layer + 1;
	const grid_number = Math.floor(cell_number / 9);

	// Cell isn't active if we've checked past the outermost grid.
	if (cell_layer >= board_depth + 2) {
		return false;
	}
	// Check if grid is active directly.
	if (active_grids[cell_layer] && active_grids[cell_layer][cell_number]) {
		return true;
	}

	// Check if the grid the cell is in is active.
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