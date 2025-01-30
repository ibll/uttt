import client from './events/outgoing.js';

const player_pieces = {
	0: 'X',
	1: 'O'
}

export let games = {};

export function createGame(size) {
	const id = createGameID(6);
	games[id] = new Game(id, size);
	return id;
}

function createGameID(length) {
	const consonants = 'bcdfghjkmnrstyz';
	const vowels = 'aeiou';

	let id = '';

	for (let i = 0; i < length; i++) {
		if ((i + 1) % 2 === 0)
			id += vowels[Math.floor(Math.random() * vowels.length)];
		else
			id += consonants[Math.floor(Math.random() * consonants.length)];
	}

	return id;
}

export function join(ws, game_id, automatic) {
	game_id = game_id?.trim().toLowerCase();
	const game = games[game_id];

	// Reset client if it's automatically on a game that no longer exists
	if (!game) {
		if (automatic) return client.updateState(ws, undefined);
		else return client.display(ws, `Room '${game_id}' doesn't exist!`);
	}

	game.subscribers.push(ws);
	client.updateState(ws, game_id, game.board_depth, game.board_state, game.active_grids, game.getClientPiece(ws), game.active_player === 0 ? 'cross' : 'nought', game.moves, game.start_time, game.end_time, game.endless);
}

export function pruneOldGames() {
	const now = Date.now();
	const old_games = Object.keys(games).filter(game_id => games[game_id].last_interaction < now - 1000 * 60 * 60 * 36);
	old_games.forEach(game_id => {
		console.log(`Pruning game ${game_id}`);
		delete games[game_id];
	});
	console.log(`Pruned ${old_games.length} games`);
}

export class Game {
	constructor(game_id, size) {
		this.game_id = game_id;
		this.board_depth = size;
		this.board_state = {};
		this.active_grids = {};
		this.active_player = 0;
		this.moves = 0;
		this.queued_pieces = [];
		this.start_time = undefined;
		this.end_time = undefined;
		this.players = [];
		this.subscribers = [];
		this.last_cell = undefined;
		this.endless = false;
		this.last_interaction = Date.now();

		if (size === 0) {
			this.board_depth = 1;
			this.endless = true;
		}

		console.log(`Creating game ${game_id} with size ${size}`);

		// Set all grids active
		if (!this.active_grids[this.board_depth]) this.active_grids[this.board_depth] = {};
		this.active_grids[this.board_depth][0] = true;
	}

	getClientPiece(ws) {
		const connection_id = ws.connection_id || null;
		// If both this.players are on one device, indicate that
		if (this.players[0] === connection_id && this.players[1] === connection_id) return 'both';
		// Otherwise return their piece id if any
		if (this.players[0] === connection_id) return 'cross';
		if (this.players[1] === connection_id) return 'nought';
		return null;
	}

	place(cell_layer, cell_number, ws, previous_cells) {
		const cell_layer_size = Math.pow(9, this.board_depth - cell_layer)
		const grid_layer = cell_layer + 1;
		const grid_number = Math.floor(cell_number / 9);
		const pos_in_grid = cell_number % 9;
		const connection_id = ws?.connection_id || null;

		// Ensure game is running
		if (this.board_depth === undefined)
			return // console.error('Game has not been started');

		// Ensure cell is within bounds
		if (cell_number < 0 || cell_number >= cell_layer_size)
			return // console.error(`Cell ${cell_layer}.${cell_number} is out of bounds for layer ${cell_layer}`);

		// Ensure cell is not already filled
		if (this.board_state[cell_layer]?.[cell_number] !== undefined)
			return // console.error(`Cell ${cell_layer}.${cell_number} is already filled`);

		// Ensure cell is not within a claimed grid
		if (!this.isCellUnclaimed(cell_layer, cell_number))
			return // console.error(`Cell ${cell_layer}.${cell_number} is within a claimed grid`);

		// Ensure cell is active
		if (!previous_cells && !this.isCellActive(cell_layer, cell_number))
			return // console.error(`Cell ${cell_layer}.${cell_number} is not active`);

		// Assign this.players on the first two turns
		if (this.players[this.active_player] === undefined) {
			this.players[this.active_player] = connection_id;
			client.registerPiece(ws, this.getClientPiece(ws));
		}

		// Ensure only the allowed player is placing
		if (connection_id !== this.players[this.active_player] && connection_id !== null)
			return // console.error(`It is not ${connection_id}'s turn to place`);

		// Start game timer if necessary
		if (!this.start_time) this.start_time = Date.now();

		// Update last interaction time
		this.last_interaction = Date.now();

		// Place the piece
		if (!this.board_state[cell_layer]) this.board_state[cell_layer] = {};
		this.board_state[cell_layer][cell_number] = connection_id ? this.active_player : null;
		// console.log(`${connection_id ? player_pieces[this.active_player] : null} placed at ${cell_layer}.${cell_number}`);

		if (cell_layer === 0) {
			this.last_cell = cell_number;
		}

		if (cell_layer === 0) this.moves++;

		const piece = connection_id ? this.active_player : null;
		this.queued_pieces.push({cell_layer, cell_number, piece});

		// Win the grid if necessary
		let already_set_active = false;
		const winner = this.checkWhoWonGrid(grid_layer, grid_number);
		if (winner !== undefined) {
			// console.log(`${ winner !== null ? player_pieces[winner] : null} won grid ${grid_layer}.${grid_number}!`);

			if (!previous_cells) previous_cells = {};
			previous_cells[cell_layer] = cell_number % 9;

			let set_active;
			if (winner !== null) {
				set_active = this.place(grid_layer, grid_number, ws, previous_cells);
			} else {
				set_active = this.place(grid_layer, grid_number, null, previous_cells)
			}

			if (set_active) already_set_active = true;

			// Don't set an active grid if the game is over
			if (grid_layer >= this.board_depth) {
				const winner_piece = ws?.connection_id !== undefined ? player_pieces[winner] : null;

				if (this.endless) {
					console.log(`${winner_piece} won layer ${this.board_depth} in endless game ${this.game_id}`);

					// Don't want to tell clients about any pieces to place,
					// we're about to send them entirely new board information
					// and could end up double-sending pieces
					this.queued_pieces = [];

					this.expand();
					already_set_active = true;
				} else {
					console.log(`${winner_piece} won game ${this.game_id}`);
					this.active_grids = {};
					this.end_time = Date.now();
					const already_set_active = true;
					return already_set_active;
				}
			}
		}

		// Set next active grid
		if (grid_layer < this.board_depth && !already_set_active) {
			this.findNextActiveGrid(grid_layer + 1, Math.floor(grid_number / 9), pos_in_grid, previous_cells);
			already_set_active = true;
		}

		// Switch active player and update clients
		if (cell_layer === 0) {
			this.active_player = 1 - this.active_player;
			this.subscribers.forEach(subscriber => {
				client.pieceUpdate(subscriber, this.queued_pieces, this.active_grids, this.active_player === 0 ? 'cross' : 'nought', this.moves);
			});
			this.queued_pieces = [];
		}

		return already_set_active;
	}

	findNextActiveGrid(grid_layer, grid_number, pos_in_grid, previous_cells) {
		const cell_layer = grid_layer - 1;
		const cell_number = grid_number * 9;
		const next_number = cell_number + pos_in_grid;

		this.active_grids = {};
		if (!this.active_grids[cell_layer]) this.active_grids[cell_layer] = {};

		if (this.board_state[cell_layer]?.[next_number] !== undefined)
			return this.findNextActiveGrid(grid_layer + 1, Math.floor(grid_number / 9), grid_number % 9);

		this.active_grids[cell_layer][next_number] = true;

		if (previous_cells?.[cell_layer - 2] !== undefined && cell_layer > 1)
			return this.findNextActiveGrid(cell_layer, next_number, previous_cells[cell_layer - 2], previous_cells);
	}

	isCellUnclaimed(cell_layer, cell_number) {
		const grid_layer = cell_layer + 1;
		const grid_number = Math.floor(cell_number / 9);

		if (this.board_state[cell_layer]?.[cell_number] !== undefined)
			return false;

		if (grid_layer >= this.board_depth + 1)
			return true;

		return this.isCellUnclaimed(grid_layer, grid_number);
	}

	isCellActive(cell_layer, cell_number) {
		const grid_layer = cell_layer + 1;
		const grid_number = Math.floor(cell_number / 9);

		// Cell isn't active if we've checked past the outermost grid.
		if (cell_layer >= this.board_depth + 2)
			return false;

		// Check if grid is active directly.
		if (this.active_grids[cell_layer] && this.active_grids[cell_layer][cell_number])
			return true;

		// Check if the grid the cell is in is active.
		return this.isCellActive(grid_layer, grid_number);
	}

	checkWhoWonGrid(grid_layer, grid_number) {
		const cell_layer = grid_layer - 1;
		const first_cell_number = grid_number * 9;
		const cells = Array.from({length: 9}, (_, i) => this.board_state[cell_layer]?.[first_cell_number + i]);

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
			const winner = this.checkWhoWonLine(...line);
			if (winner !== undefined && line[0] !== null) return winner;
		}

		if (cells.every(cell => cell !== undefined)) return null;

		return undefined;
	}

	checkWhoWonLine(c0, c1, c2) {
		if (c0 === c1 && c1 === c2 && c0 !== undefined) return c0;
		return undefined;
	}

	expand() {
		const new_board_depth = this.board_depth + 1;
		const new_board_state = {};
		const new_active_grids = {};
		new_active_grids[new_board_depth] = {0: true};

		let sub_cell_shift = this.last_cell;
		while (sub_cell_shift >= 9) {
			sub_cell_shift = Math.floor(sub_cell_shift / 9);
		}

		for (const cl in this.board_state) {
			const cell_layer = parseInt(cl);
			new_board_state[cell_layer] = {};
			const cell_layer_size = Math.pow(9, this.board_depth - cell_layer);

			for (const cn in this.board_state[cell_layer]) {
				const cell_number = parseInt(cn);
				new_board_state[cell_layer][cell_number + cell_layer_size * sub_cell_shift] = this.board_state[cell_layer][cell_number];
			}
		}

		this.board_depth = new_board_depth
		this.board_state = new_board_state;
		this.active_grids = new_active_grids;
		this.subscribers.forEach(ws => {
			client.updateState(ws, this.game_id, this.board_depth, this.board_state, this.active_grids, this.getClientPiece(ws), this.active_player === 0 ? 'cross' : 'nought', this.moves, this.start_time, this.end_time, this.endless);
		});
	}
}