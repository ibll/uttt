import clients from './server_events/outgoing.js';

export let board_depth;
export let board_state;
export let active_grids;
let active_player;
let players = [];

const player_pieces = {
	0: 'X',
	1: 'O',
}

export function start(size) {
	board_depth = size;
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

	// Ensure cell is not within a claimed grid
	if (!isCellUnclaimed(cell_layer, cell_number))
		return console.error(`Cell ${cell_layer}.${cell_number} is within a claimed grid`);

	// Ensure cell is active
	if (!previous_cells && !isCellActive(cell_layer, cell_number))
		return console.error(`Cell ${cell_layer}.${cell_number} is not active`);

	// Assign players on the first two turns
	if (players[active_player] === undefined)
		players[active_player] = connection_id;

	// Ensure only the allowed player is placing
	if (connection_id !== players[active_player] && connection_id !== null)
		return console.error(`It is not ${active_player === 0 ? 'X' : 'O'}'s turn to place`);

	// Place the piece
	if (!board_state[cell_layer]) board_state[cell_layer] = {};
	board_state[cell_layer][cell_number] = connection_id ? active_player : null;
	console.log(`${connection_id ? player_pieces[active_player] : null} placed at ${cell_layer}.${cell_number}`);
	clients.place(cell_layer, cell_number, connection_id ? active_player : null);

	// Set next active grid
	if (grid_layer < board_depth) {
		findNextActiveGrid(grid_layer + 1, Math.floor(grid_number / 9), pos_in_grid, previous_cells);
	}

	// Win the grid if necessary
	const winner = checkWhoWonGrid(grid_layer, grid_number);
	if (winner !== undefined) {
		const piece = winner ? player_pieces[winner] : null;
		console.log(`${piece} won grid ${grid_layer}.${grid_number}!`);

		if (!previous_cells) previous_cells = {};
		previous_cells[cell_layer] = cell_number % 9;
		const player = winner === null ? null : players[winner];
		place(grid_layer, grid_number, player, previous_cells);

		if (grid_layer === board_depth) {
			active_grids = {};
		}
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

function isCellUnclaimed(cell_layer, cell_number) {
	const grid_layer = cell_layer + 1;
	const grid_number = Math.floor(cell_number / 9);

	if (board_state[cell_layer]?.[cell_number] !== undefined) {
		return false;
	}

	if (grid_layer >= board_depth + 1) {
		return true;
	}

	return isCellUnclaimed(grid_layer, grid_number);
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
	const cells = Array.from({ length: 9 }, (_, i) => board_state[cell_layer]?.[first_cell_number + i]);

	const lines = [
		[cells[0], cells[1], cells[2]], // rows
		[cells[3], cells[4], cells[5]],
		[cells[6], cells[7], cells[8]],
		[cells[0], cells[3], cells[6]], // columns
		[cells[1], cells[4], cells[7]],
		[cells[2], cells[5], cells[8]],
		[cells[0], cells[4], cells[8]], // diagonals
		[cells[2], cells[4], cells[6]]
	];

	for (const line of lines) {
		const winner = checkWhoWonLine(...line);
		if (winner !== undefined) return winner;
	}

	if (cells.every(cell => cell !== undefined)) return null;

	return undefined;
}

function checkWhoWonLine(c0, c1, c2) {
	if (c0 === c1 && c1 === c2 && c0 !== undefined) return c0;
	return undefined;
}