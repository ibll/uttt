import server from '../client_events/outgoing.js';
import status from "./status.js";

export let board_depth;
export let board_state = {};
export let active_grids = {};
let cell_count = {};

export function updateState(new_board_depth, new_board_state, new_active_grids) {
	board_depth = new_board_depth;
	board_state = new_board_state;
	active_grids = new_active_grids;
	cell_count = {};

	createBoard(new_board_depth);

	for (const layer in board_state) {
		for (const cell_id in board_state[layer]) {
			const player_num = board_state[layer][cell_id];
			place(layer, cell_id, player_num);
		}
	}

	setActiveGrids(active_grids);
}

export function createBoard(depth) {
	const board = document.getElementById('board');
	board.innerHTML = '';

	if (!board_depth) return;

	console.log(`Creating board of size ${depth}`);
	createBoardInCell(board, depth, depth);

	board.querySelectorAll('.cell').forEach(cell => {
		cell.addEventListener('click', () => {
			server.place(cell.id);
		})
	})
}

function createBoardInCell(outerCell, layer, depth) {
	if (!board_state[layer]) board_state[layer] = {};

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const cell = document.createElement('div');
			if (!cell_count[layer]) cell_count[layer] = 0;
			cell.id = `cell.${layer - 1}.${cell_count[layer]++}`;

			cell.classList.add('grid');
			if (layer === 1) cell.classList.add('cell');

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

export function place(cell_layer, cell_number, player) {
	if (!board_state[cell_layer]) board_state[cell_layer] = {};
	board_state[cell_layer][cell_number] = player;

	console.log(player);

	cell_layer = parseInt(cell_layer);
	cell_number = parseInt(cell_number);
	if (player !== null) player = parseInt(player);

	let pieces = {};
	pieces.cross = `
		<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="5" y="18" width="18.3137" height="250" rx="9.15685" transform="rotate(-45 5 18)" fill="var(--red)"/>
			<rect x="182" y="5" width="18.3137" height="250" rx="9.15685" transform="rotate(45 182 5)" fill="var(--red)"/>
		</svg>
	`
	pieces.nought = `
		<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clip-path="url(#clip0_2_2)">
				<circle cx="100" cy="100" r="93" stroke="var(--blue)" stroke-width="14"/>
			</g>
			<defs>
				<clipPath id="clip0_2_2">
					<rect width="200" height="200" fill="white"/>
				</clipPath>
			</defs>
		</svg>
	`
	pieces.dash = `
	<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="5" y="109" width="18" height="190" rx="9" transform="rotate(-90 5 109)" fill="var(--grey)"/>
	</svg>
	`

	let cell;

	if (cell_layer >= board_depth) {
		cell = document.getElementById('board');
	} else {
		cell = document.getElementById(`cell.${cell_layer}.${cell_number}`);
	}

	if (cell) {
		// if (cell_layer === 0) {
		if ((board_depth === 1 && cell_layer < board_depth) || cell_layer < board_depth - 1) {
			cell.innerHTML = pieces[player === 0 ? 'cross' : 'nought'];
		// } else if (cell_layer >= board_depth) {
		// 	return;
		} else {
			let colour = '--grey';
			if (player === 0) colour = '--red';
			if (player === 1) colour = '--blue';

			const overlay = document.createElement('div');
			overlay.classList.add('overlay');
			overlay.style.outline = `var(${colour}) solid ${cell_layer * 2}px`;
			overlay.style.backgroundColor = `var(${colour}-trans)`;
			overlay.style.borderRadius = (20/board_depth) + 2*cell_layer + 'px';
			cell.prepend(overlay);
		}
		cell.classList.add('played');
	}

	if (cell_layer >= board_depth) status.display(`${player === 0 ? 'X' : 'O'} wins!`, 10000);

}

export function setActiveGrids(active_grids) {
	document.querySelectorAll('.grid').forEach(cell => {
		cell.classList.remove('active');
	})

	if (!active_grids) return;

	for (const layer in active_grids) {
		for (const grid_num in active_grids[layer]) {
			makeGridActive(parseInt(layer), parseInt(grid_num));
		}
	}
}

function makeGridActive(level, grid_num) {
	if (level === 1) {
		const cell = document.getElementById(`cell.${level}.${grid_num}`);
		if (cell) cell.classList.add('active');
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
