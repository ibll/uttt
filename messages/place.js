import { place } from '../uttt.js';

export default async (ws, payload) => {
	const cell_id = payload.cell_id;
	const cell_layer = parseInt(cell_id.split('.')[1]);
	const cell_number = parseInt(cell_id.split('.')[2]);
	place(cell_layer, cell_number, ws.connection_id);
}