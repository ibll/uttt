import { setActiveGrids } from '../uttt.js';

export default async (ws, payload) => {
	console.log(payload);
	setActiveGrids(payload.active_grids);
}