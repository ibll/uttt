import { setActiveGrids } from '../uttt.js';

export default async (ws, payload) => {
	setActiveGrids(payload.active_grids);
}