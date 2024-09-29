import { place } from '../uttt.js';

export default async (ws, payload) => {
	const cell_id = payload.cell_id;
	const cell_layer = 0;
	const cell_number = parseInt(cell_id.split('.')[2])

	console.log(`${ws.connection_id} requested to place at ${cell_layer}.${cell_number}`);
	place(cell_layer, cell_number, ws.connection_id);
}