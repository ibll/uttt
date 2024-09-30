import {active_grids, board_depth, board_state} from '../../uttt.js';
import clients from '../outgoing.js';

export default async (ws) => {
	clients.privateUpdateState(ws, board_depth, board_state, active_grids)
}