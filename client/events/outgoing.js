import { ws } from "../client.js";
const server = {};

function sendToServer(message) {
	ws.send(JSON.stringify(message));
}

server.start = function(size) {
	sendToServer({type: "start", size});
}

server.sync = function() {
	sendToServer({type: "sync"});
}

server.place = function(cell_id) {
	sendToServer({type: "place", cell_id});
}

export default server;
window.server = server;