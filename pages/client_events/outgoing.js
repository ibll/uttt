import { ws } from "../client.js";
const server = {};

function sendToServer(message) {
	ws.send(JSON.stringify(message));
}

server.start = function() {
	sendToServer({type: "start"});
}

server.sync = function() {
	sendToServer({type: "sync"});
}

server.place = function(cell_id) {
	sendToServer({type: "place", cell_id});
}

export default server;