import server from '../events/outgoing.js';
import status from "./toast.js";
import {icons} from "../assets/icons.js";
import {addLeaveButton, adjustTitleText, connection_id, resetStartButton} from "../client.js";
import status_bar from "./status_bar.js";

export let game_id;
export let board_depth;
export let board_state = {};
export let active_grids = {};
let cell_count = {};
let moves;
let start_time;
let end_time;
let endless;
let won = false;

let timeInterval;

window.getBoardState = () => board_state;

export function updateState(payload) {
	// Server said game doesn't exist anymore, exit lobby
	if (!payload.game_id && window.location.hash) {
		window.location.hash = '';
		window.location.href = '/';
		return;
	}

	if (game_id !== payload.game_id) {
		game_id = payload.game_id;
		status.display(`Joined game ${game_id}`)
		window.location.hash = game_id;
	}

	board_depth = payload.board_depth;
	board_state = payload.board_state;
	active_grids = payload.active_grids;
	moves = payload.moves;
	start_time = payload.start_time;
	end_time = payload.end_time;
	endless = payload.endless;

	cell_count = {};

	addLeaveButton();
	statusBarSetGameInfo();

	createBoard(board_depth);

	for (const layer in board_state) {
		for (const cell_id in board_state[layer]) {
			const player_num = board_state[layer][cell_id];
			place(layer, cell_id, player_num);
		}
	}

	setActiveGrids(active_grids, payload.next_player_id);
	setPiece(payload.client_piece)
}

export function setPiece(piece) {
	document.getElementById('piece-marker').innerHTML = piece ? icons[piece] : '';
	adjustTitleText();
}

export function createBoard(depth) {
	const board = document.getElementById('board');
	board.classList.add('grid');
	board.classList.remove('played');
	board.innerHTML = '';

	if (!board_depth) return;

	console.log(`Creating board of size ${depth}`);
	createBoardInCell(board, depth, depth);
}

function createBoardInCell(outerCell, layer, depth) {
	if (!board_state[layer]) board_state[layer] = {};

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const cell = document.createElement('div');
			if (!cell_count[layer]) cell_count[layer] = 0;
			cell.id = `cell.${layer - 1}.${cell_count[layer]++}`;

			cell.classList.add('grid');
			if (layer === 1) {
				cell.classList.add('cell');
				cell.onclick = () => server.place(game_id, cell.id);
				cell.onkeydown = (e) => {
					if (e.key === 'Enter' || e.key === ' ') server.place(game_id, cell.id);
				}
			}

			cell.style.borderWidth = layer / 2 + 'px';
			cell.style.setProperty('--overlay-radius', `${layer*2}px`);
			cell.style.borderColor = `var(--c${layer})`

			if (i === 0) cell.classList.add('top');
			if (i === 2) cell.classList.add('bottom');
			if (j === 0) cell.classList.add('left');
			if (j === 2) cell.classList.add('right');

			if (layer > 1) createBoardInCell(cell, layer - 1, depth);

			outerCell.appendChild(cell);
		}
	}
}

export function place(cell_layer, cell_number, player, moves) {
	if (moves) status_bar.updateBlock('move', moves);
	if (!start_time) start_time = Date.now();

	if (!board_state[cell_layer]) board_state[cell_layer] = {};
	board_state[cell_layer][cell_number] = player;

	cell_layer = parseInt(cell_layer);
	cell_number = parseInt(cell_number);
	if (player !== null) player = parseInt(player);

	let cell;

	if (cell_layer >= board_depth) {
		cell = document.getElementById('board');
	} else {
		cell = document.getElementById(`cell.${cell_layer}.${cell_number}`);
	}

	if (cell) {
		if ((board_depth === 1 && cell_layer < board_depth) || cell_layer < board_depth - 1) {
			let piece_marker = 'dash';
			if(player === 0) piece_marker = 'cross'
			if(player === 1) piece_marker = 'nought'
			cell.innerHTML = icons[piece_marker];
		} else if (cell_layer < board_depth) {
			let colour = '--text';
			if (player === 0) colour = '--red';
			if (player === 1) colour = '--blue';

			const overlay = document.createElement('div');
			overlay.classList.add('overlay');

			overlay.style.outline = `var(${colour}) solid ${cell_layer * 2}px`;
			if (cell_layer !== board_depth) overlay.style.backgroundColor = `var(${colour}-trans)`;
			overlay.style.borderRadius = (20/board_depth) + 2*cell_layer + 'px';

			cell.prepend(overlay);
		}
		cell.classList.add('played');
	}

	// Check for win
	if (cell_layer >= board_depth) {
		won = true;

		if (!end_time) end_time = Date.now();

		if (endless) return;
		if (player == null) status.display('Draw!', Infinity);
		else  status.display(`${player === 0 ? 'X' : 'O'} wins!`, Infinity);
	}

}

export function setActiveGrids(active_grids, next_player_id) {
	document.querySelectorAll('.grid.active').forEach(grid => {
		grid.querySelectorAll('.cell').forEach(cell => {
			cell.tabIndex = -1;
		})
		grid.classList.remove('active');
	})

	if (!active_grids) return;

	if (!won) {
		if (next_player_id === connection_id && next_player_id !== undefined)
			status.display("Your turn!", Infinity, true);
		else if (next_player_id !== null)
			status.display('', Infinity, true);
	}

	for (const layer in active_grids) {
		for (const grid_num in active_grids[layer]) {
			makeGridActive(parseInt(layer), parseInt(grid_num));
		}
	}
}

function makeGridActive(level, grid_num) {
	if (level === 1) {
	console.log('activing...')
		const grid = document.getElementById(`cell.${level}.${grid_num}`) || document.getElementById('board');
		if (!grid) return;
		grid.querySelectorAll('.cell:not(.played)').forEach(cell => {
			cell.tabIndex = 0;
		});
		grid.classList.add('active');
		return;
	}

	if (level > 1) {
		const first_sub_cell = grid_num * 9;

		for (let cell = 0; cell < 9; cell++) {
			if (board_state[level - 1] && board_state[level - 1][first_sub_cell + cell] !== undefined) continue;
			makeGridActive(level - 1, first_sub_cell + cell);
		}
	}
}

export function statusBarSetGameInfo() {
	resetStartButton();

	status_bar.reset()
	status_bar.addBlock('move', 'move', moves);
	status_bar.addBlock('room', 'room', game_id);
	status_bar.addBlock('time', 'time', '00:00:00');

	updateTime();
	if (!end_time) timeInterval = setInterval(updateTime, 1000)
}

function updateTime() {
	if (!start_time || !document.getElementById('time')) return;

	let elapsedTime;
	if (end_time) elapsedTime = end_time - start_time;
	else elapsedTime = Date.now() - start_time;

	status_bar.updateBlock('time', getTimeString(elapsedTime));
	if (end_time) return clearInterval(timeInterval);
}

function getTimeString(interval) {
	const elapsedTime = interval
	const seconds = Math.floor(elapsedTime / 1000) % 60;
	const minutes = Math.floor(elapsedTime / 60000) % 60;
	const hours = Math.floor(elapsedTime / 3600000);
	return `${getTimeSegment(hours)}:${getTimeSegment(minutes)}:${getTimeSegment(seconds)}`;
}

function getTimeSegment(number) {
	return number.toString().padStart(2, '0');
}