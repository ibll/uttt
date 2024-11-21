import {updateState} from '../../scripts/uttt.js';

export default async (ws, payload) => {
	const game_id = payload.game_id;
	const board_depth = payload.board_depth;
	const board_state = payload.board_state;
	const active_grids = payload.active_grids;
	const client_piece = payload.client_piece;

	updateState(game_id, board_depth, board_state, active_grids, client_piece);
}