export default async (ws, payload) => {
	console.log(payload)
	const size = payload.size;

	const board = document.getElementById('board');
	board.innerHTML = "";
	fillBoard(board, size, size);
}

function fillBoard(element, size, maxSize) {

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const cell = document.createElement('div');
			cell.classList.add('cell');

			const colors = [
				'#355070',
				'#e56b6f',
				 '#6d597a',
				'#eaac8b',
				'#b56576',
			];
			// cell.style.backgroundColor = colors[maxSize - size];
			cell.style.borderWidth = size;
			if (size === 1) cell.style.backgroundColor = '#fdfcdc';

			if (size > 1) fillBoard(cell, size - 1, maxSize);

			element.appendChild(cell);
		}
	}
}