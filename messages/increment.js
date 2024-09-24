import { wss } from '../index.js';

let value= 0;

export default async (ws, payload) => {
	let increment =  1;
	if (payload.by) increment = Number.parseInt(payload.by);

	value += increment;
	console.log(`${ws.connection_id} incremented by ${payload.by}`);

	wss.clients.forEach(client => {
		client.send(JSON.stringify({type: "increment", value}));
	});
	// ws.send(JSON.stringify({type: "increment", value}));
}