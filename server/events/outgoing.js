const client_API = {};

function sendToClient(ws, message) {
	ws.send(JSON.stringify(message));
}

client_API.notify = function(ws, content) {
	sendToClient(ws, {type: "notify", content});
}

client_API.prepareClient = function(ws, client_events, client_events_path) {
	sendToClient(ws, {type: "prepare_client", client_events, client_events_path});
}

client_API.updateState = function(ws, game_id, board_depth, board_state, active_grids, client_piece, next_player_id, moves, start_time, end_time) {
	sendToClient(ws, {type: "update_state", game_id, board_depth, board_state, active_grids, client_piece, next_player_id, moves, start_time, end_time});
}

client_API.registerPiece = function(ws, piece) {
	sendToClient(ws, {type: "register_piece", piece});
}

client_API.place = function(ws, cell_layer, cell_number, player, moves) {
	sendToClient(ws, {type: "place", cell_layer, cell_number, player, moves})
}

client_API.setActiveGrid = function(ws, active_grids, next_player_id) {
	sendToClient(ws, {type: "set_active_grids", active_grids, next_player_id});
}

export default client_API;