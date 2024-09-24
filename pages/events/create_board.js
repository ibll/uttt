export default async (ws, payload) => {
	console.log(payload)
	const size = payload.size;

	const board = document.getElementById('board');
	board.innerHTML = "";
	fillBoard(board, size, size);

	// const cellItems = board.querySelectorAll('.cell, .grid');
	// console.log(cellItems)
	// cellItems.forEach((cell) => {
	// 	console.log("Added")
	// 	cell.addEventListener('mouseover', () => {
	// 		cell.classList.add('hover');
	// 	});
	// 	cell.addEventListener('mouseout', () => {
	// 		cell.classList.remove('hover');
	// 	});
	// });
}

var cellVals = {};

function fillBoard(element, size, maxSize) {
	if (!cellVals[size]) cellVals[size] = 0;

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const cell = document.createElement('div');
			cell.id = 'cell.' + size + '.' + cellVals[size]++

			cell.classList.add('grid');
			if (size === 1) cell.classList.add('cell');

			cell.style.borderWidth = size/2 + 'px';
			// cell.style.margin = -size/2 + 'px';
			cell.style.borderColor = `var(--c${size})`

			if (i === 0) cell.style.borderTop = 'none';
			if (i === 2) cell.style.borderBottom = 'none';
			if (j === 0) cell.style.borderLeft = 'none';
			if (j === 2) cell.style.borderRight = 'none';

			if (size > 1) fillBoard(cell, size - 1, maxSize);

			element.appendChild(cell);
		}
	}
}