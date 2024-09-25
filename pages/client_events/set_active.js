import { setActive } from '../uttt.js';

export default async (ws, payload) => {
	setActive(payload.active_cells);
}