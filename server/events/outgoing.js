const client_API = {};

function sendToClient(ws, message) {
  console.log(message)
  ws.send(JSON.stringify(message));
}

client_API.display = function (ws, content) {
  sendToClient(ws, { type: "display", content });
}

client_API.prepareClient = function (ws, client_events, client_events_path, connection_id) {
  sendToClient(ws, { type: "prepare_client", client_events, client_events_path, connection_id });
}

client_API.updateState = function (ws, game_id, board_depth, board_state, active_layer, active_grid_num, client_piece, next_player_id, moves, start_time, end_time, endless) {
  sendToClient(ws, {
    type: "update_state",
    game_id,
    board_depth,
    board_state,
    active_layer,
    active_grid_num,
    client_piece,
    next_player_id,
    moves,
    start_time,
    end_time,
    endless
  });
}

client_API.registerPiece = function (ws, game_id, piece) {
  sendToClient(ws, { type: "register_piece", game_id, piece });
}

client_API.pieceUpdate = function (ws, game_id, pieces, active_layer, active_grid_num, next_piece, moves) {
  sendToClient(ws, { type: "piece_update", game_id, pieces, active_layer, active_grid_num, next_piece, moves });
};

export default client_API;
