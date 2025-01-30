import {createGame, join} from '../../uttt.js';

export default async (ws, payload) => {
	const size = parseInt(payload.size);
	const game_id = createGame(size);

	join(ws, game_id);
}