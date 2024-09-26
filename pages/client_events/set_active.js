import { setActive } from '../uttt.js';

export default async (ws, payload) => {
	console.log(payload);
	setActive(payload.active_cells);
}