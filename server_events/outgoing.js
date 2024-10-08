import {wss} from "../index.js";

const clients_API = {};

function sendToClient(client, message) {
	client.send(JSON.stringify(message));
}

function sendToClients(message) {
	wss.clients.forEach(client => {
		client.send(JSON.stringify(message));
	});
}

clients_API.privateUpdateState = function(client, board_depth, board_state, active_grids) {
	sendToClient(client, {type: "update_state", board_depth, board_state, active_grids});
}

clients_API.updateState = function(board_depth, board_state, active_grids) {
	sendToClients({type: "update_state", board_depth, board_state, active_grids});
}

clients_API.place = function(cell_layer, cell_number, player) {
	sendToClients({type: "place", cell_layer, cell_number, player})
}

clients_API.setActiveGrid = function(active_grids, next_player_id) {
	sendToClients({type: "set_active_grids", active_grids, next_player_id});
}

export default clients_API;