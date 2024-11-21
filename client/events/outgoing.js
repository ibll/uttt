import { ws } from "../client.js";
const server = {};

function sendToServer(message) {
	ws.send(JSON.stringify(message));
}

server.start = function(size) {
	sendToServer({type: "start", size});
}

server.join = function(game_id) {
	sendToServer({type: "join", game_id});
}

server.place = function(game_id, cell_id) {
	sendToServer({type: "place", game_id, cell_id});
}

export default server;
window.server = server;