import { setActiveGrids } from '../../scripts/uttt.js';
import status from "../../scripts/status.js";
import { connection_id } from "../../client.js";

export default async (ws, payload) => {
	setActiveGrids(payload.active_grids);

	if (payload.next_player_id === connection_id && payload.next_player_id !== undefined)
		status.display("Your turn!", Infinity, true);
	else
		status.display(null, Infinity, true);
}