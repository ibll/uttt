import { setActiveGrids } from '../../scripts/uttt.js';

export default async (ws, payload) => {
	setActiveGrids(payload.active_grids, payload.next_player_id);
}