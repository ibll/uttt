import {join} from '../../uttt.js'

export default async (ws, payload) => {
	const game_id = payload.game_id;
	const automatic = payload.automatic;
	join(ws, game_id, automatic);
}