import io from "@pm2/io";
import fs from "fs";
import path from "path";
import {v4 as uuidv4} from "uuid";
import {WebSocketServer} from "ws";
import clients from "./events/outgoing.js";

const __dirname = import.meta.dirname;

const CLIENT_EVENTS_DIR = './events/incoming';
const SERVER_EVENTS_DIR = './events/incoming';
const ABSOLUTE_CLIENT_EVENTS_DIR = path.join(__dirname, '../client/', CLIENT_EVENTS_DIR);
const CLIENT_EVENTS = fetchEventsIn(ABSOLUTE_CLIENT_EVENTS_DIR);

const connected_clients = io.counter({
	name: 'Connected Clients',
	id: 'connected_clients'
});

export function createWSS(server) {
	const wss = new WebSocketServer({ server });
	wss.on('connection', wssConnection);
	return wss;
}

async function wssConnection(ws, response) {
	connected_clients.inc();

	// Find or set a unique connection_id to the client.
	const cookies = response.headers?.cookie?.split('; ');
	const connection_cookie = cookies?.find(cookie => cookie.startsWith('connection_id='));
	if (connection_cookie) {
		const [, value] = connection_cookie.split('=');
		ws.connection_id = value;
	}
	if (!ws.connection_id) {
		const connection_id = uuidv4()
		ws.connection_id = connection_id
	}

	clients.prepareClient(ws, CLIENT_EVENTS, CLIENT_EVENTS_DIR, ws.connection_id);

	// console.log(`Client connected: ${ws.connection_id}`);

	// Add event listeners for the connection

	ws.on('message', async (data) => {
		try {
			let payload = JSON.parse(data)
			if (!payload.type) return;

			const filePath = path.join(__dirname, SERVER_EVENTS_DIR,  payload.type + '.js');
			fs.readFile(filePath, (err) => {
				if (!ws.connection_id) {
					console.error(`Client does not have a connection id. ${payload}`);
				}
				if (err) return console.error(`Message type '${payload.type}' not found`);
				import(filePath)
					.then(module => module.default(ws, payload))
					.catch(err => console.error(err));
			});
		} catch {
			console.error(`Couldn't parse message:\n${data}`);
		}
	});

	ws.on('close', () => {
		// console.log(`Client disconnected: ${ws.connection_id}`);
		connected_clients.dec();
	});
}

function fetchEventsIn(dir) {
	return fs.readdirSync(dir).filter(file => file.endsWith('.js')).map(file => file.slice(0, -3));
}
