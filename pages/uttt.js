import { ws } from './client.js';
export let board_state = {};
export let active_grids = {};
let cell_count = {};

export function start(depth) {
	const board = document.getElementById('board');
	board.innerHTML = '';

	board_state = {};
	cell_count = {};

	console.log(`Creating board of size ${depth}`);
	createBoardInCell(board, depth, depth);

	board.querySelectorAll('.cell').forEach(cell => {
		cell.addEventListener('click', () => {
			ws.send(JSON.stringify({type: "place", cell_id: cell.id}))
		})
	})
}

export function updateBoard(depth, new_board_state, new_active_grids) {
	start(depth)
	board_state = new_board_state;
	active_grids = new_active_grids;

	for (const layer in board_state) {
		for (const cell_id in board_state[layer]) {
			const player_num = board_state[layer][cell_id];
			place(layer, cell_id, player_num);
		}
	}

	setActive(active_grids);
}

function createBoardInCell(outerCell, layer, depth) {
	if (!board_state[layer]) board_state[layer] = {};

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const cell = document.createElement('div');
			if (!cell_count[layer]) cell_count[layer] = 0;
			cell.id = 'cell.' + layer + '.' + cell_count[layer]++

			cell.classList.add('grid');
			if (layer === 1) cell.classList.add('cell');

			cell.style.borderWidth = layer/2 + 'px';
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

export function place(layer, cell_num, player) {
	if (layer !== 1) console.log(layer, cell_num, player);

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

	console.log(`Requesting server place at cell.${layer}.${cell_num}`);
	const cell = document.getElementById(`cell.${layer}.${cell_num}`);
	cell.innerHTML = pieces[player === 0 ? 'cross' : 'nought'];

	cell.classList.add('played');
}

export function setActive(active_cells) {
	document.querySelectorAll('.grid').forEach(cell => {
		cell.classList.remove('active');
	})

	if (!active_cells) return;

	for (const layer in active_cells) {
		for (const cell_num in active_cells[layer]) {
			const cell = document.getElementById(`cell.${layer}.${cell_num}`);
			cell.classList.add('active');
		}
	}
}