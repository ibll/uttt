import {updateState} from '../uttt.js';

export default async (ws, payload) => {
	const board_depth = payload.board_depth;
	const board_state = payload.board_state;
	const active_grids = payload.active_grids;

	updateState(board_depth, board_state, active_grids);
}