import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import net from "net";
import clients from "./events/outgoing.js";

const __dirname = import.meta.dirname;

const SERVER_EVENTS_DIR = './events/incoming';

export function createTCS() {
  const tcs = net.createServer((socket) => tcsConnection(socket));
  return tcs;
}

async function tcsConnection(socket) {
  socket.send = (msg) => {
    console.log("sending " + msg + "\n");
    socket.write(msg);
  }

  console.log(`New client connected`)

  // Add event listeners for the connection

  socket.on('data', async (data) => {
    try {
      let payload = JSON.parse(data);
      if (!payload.type) return;

      console.log("received " + data.toString());

      // Find or set a unique connection_id to the client.
      if (payload.type == "init") {
        const connection_cookie = payload.connection_id;
        if (connection_cookie) {
          socket.connection_id = connection_cookie;
        }
        if (!socket.connection_id) {
          const connection_id = uuidv4()
          socket.connection_id = connection_id
        }

        clients.prepareClient(socket, "", "", socket.connection_id);
        return;
      }

      const filePath = path.join(__dirname, SERVER_EVENTS_DIR, payload.type + '.js');
      fs.readFile(filePath, (err) => {
        if (!socket.connection_id) {
          console.error(`Client does not have a connection id.`);
          return;
        }
        if (err) return console.error(`Message type '${payload.type}' not found`);
        import(filePath)
          .then(module => module.default(socket, payload))
          .catch(err => console.error(err));
      });
    } catch {
      console.error(`Couldn't parse message:\n${data}`);
    }
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
}
