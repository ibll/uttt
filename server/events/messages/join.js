import { join } from '../../uttt.js'

export default async (ws, payload) => {
	console.log(ws.connection_id + ' joining game ' + payload.game_id);
	const game_id = payload.game_id;
	join(ws, game_id);
}