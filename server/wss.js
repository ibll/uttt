import fs from "fs";
import path from "path";
import {v4 as uuidv4} from "uuid";
import {WebSocketServer} from "ws";

import clients from "./events/outgoing.js";

const __dirname = import.meta.dirname;

const CLIENT_EVENTS_DIR = './events/incoming';
const ABSOLUTE_SERVER_EVENTS_DIR = path.join(__dirname, './events/incoming');
const ABSOLUTE_CLIENT_EVENTS_DIR = path.join(__dirname, '../client/', CLIENT_EVENTS_DIR);

export function createWSS(server) {
	const wss = new WebSocketServer({ server });
	wss.on('connection', wssConnection);
	return wss;
}

async function wssConnection(ws, response) {
	// Inform the client of events it can listen for
	const client_events = fetchEventsIn(ABSOLUTE_CLIENT_EVENTS_DIR);
	clients.prepareClient(ws, client_events, CLIENT_EVENTS_DIR);

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
		ws.send(JSON.stringify({ type: "set_connection_id", connection_id }));
	}

	// Log connection
	ws.send(JSON.stringify({ type: "log", content: `Successfully connected as ${ws.connection_id}` }));
	// console.log(`Client connected: ${ws.connection_id}`);

	// Add event listeners for the connection
	for (const file of fetchEventsIn(ABSOLUTE_SERVER_EVENTS_DIR)) {
		const event = await import((`${ABSOLUTE_SERVER_EVENTS_DIR}/${file}.js`));
		ws.on(file.split('.')[0], (event_data) => {
			if (event.default) event.default(ws, event_data);
		});
	}
}

function fetchEventsIn(dir) {
	return fs.readdirSync(dir).filter(file => file.endsWith('.js')).map(file => file.slice(0, -3));
}
