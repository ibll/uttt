import { join } from '../../uttt.js'

export default async (ws, payload) => {
	console.log(`${ws.connection_id} requesting to join game ${payload.game_id}`);
	const game_id = payload.game_id;
	const automatic = payload.automatic;
	join(ws, game_id, automatic);
}