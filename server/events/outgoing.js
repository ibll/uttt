const client_API = {};

function sendToClient(ws, message) {
	ws.send(JSON.stringify(message));
}

client_API.display = function(ws, content) {
	sendToClient(ws, {type: "display", content});
}

client_API.prepareClient = function(ws, client_events, client_events_path, connection_id) {
	sendToClient(ws, {type: "prepare_client", client_events, client_events_path, connection_id});
}

client_API.updateState = function(ws, game_id, board_depth, board_state, active_grids, client_piece, next_player_id, moves, start_time, end_time, endless) {
	sendToClient(ws, {type: "update_state", game_id, board_depth, board_state, active_grids, client_piece, next_player_id, moves, start_time, end_time, endless});
}

client_API.registerPiece = function(ws, piece) {
	sendToClient(ws, {type: "register_piece", piece});
}

/**
 * @param ws {WebSocket} Connection to send message to
 * @param pieces {Array} Array of pieces
 * @param active_grids {Object} Active grids
 * @param next_piece {string} Next player piece id
 * @param moves {number} Number of moves in game
 */
client_API.pieceUpdate = function (ws, pieces, active_grids, next_piece, moves) {
	sendToClient(ws, {type: "piece_update", pieces, active_grids, next_piece, moves});
};

export default client_API;