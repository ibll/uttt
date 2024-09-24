import { wss } from '../index.js';

export default async () => {
	wss.clients.forEach(client => {
		client.send(JSON.stringify({ type: "create_board", size: 3 }))
	});
}