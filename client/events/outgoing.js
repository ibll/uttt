import { prepared, ws } from "../client.js";
const server = {};

const message_queue = [];

function sendToServer(message) {
  if (prepared) {
    ws.send(JSON.stringify(message));
  } else {
    message_queue.push(message);
  }
}

server.process_message_queue = function () {
  while (message_queue.length > 0) {
    const message = message_queue.shift();
    sendToServer(message);
  }
}

server.start = function (size) {
  sendToServer({ type: "start", size });
}

server.join = function (game_id, automatic) {
  console.log(`Requesting to join game ${game_id}`);
  sendToServer({ type: "join", game_id, automatic });
}

server.place = function (game_id, cell_id) {
  const cell_num = parseInt(cell_id.split('.')[2])
  sendToServer({ type: "place", game_id, cell_num });
}

export default server;

if (window) window.server = server;
