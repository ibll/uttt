import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';
import mime from 'mime';
import {v4 as uuidv4 } from 'uuid';

const __dirname = import.meta.dirname;
const EVENTS_DIR = './events';

const server = http.createServer((req, res) => {
	const filePath = path.join(__dirname, 'pages', req.url === '/' ? 'index.html' : req.url);
	let contentType = mime.getType(filePath) || 'text/html';

	fs.readFile(filePath, (err, content) => {
		if (err) {
			const errorPage = err.code === 'ENOENT' ? '404.html' : '500.html';
			const statusCode = err.code === 'ENOENT' ? 404 : 500;
			fs.readFile(path.join(__dirname, 'pages', errorPage), (error, errorContent) => {
				res.writeHead(statusCode, { 'Content-Type': 'text/html' });
				res.end(errorContent || `Server Error: ${err.code}`, 'utf-8');
			});
		} else {
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(content, 'utf-8');
		}
	});
});

export const wss = new WebSocketServer({ server });
const events = fs.readdirSync(EVENTS_DIR).filter(file => file.endsWith('.js'));

wss.on('connection', async (ws, response) => {

	// Find or set a unique connection_id to the client.
	response.headers?.cookie?.split('; ' ).forEach((cookie) => {
		const [key, value] = cookie.split('=');
		if (key === 'connection_id') ws.connection_id = value;
	});
	if (!ws.connection_id) {
		ws.connection_id = uuidv4();
		ws.send(JSON.stringify({ type: "set_connection_id", connection_id: ws.connection_id }));
	}

	// Log connection
	ws.send(JSON.stringify({ type: "log", content: `Successfully connected as ${ws.connection_id}` }));
	console.log(`Client connected: ${ws.connection_id}`);

	ws.send(JSON.stringify({ type: "create_board", size: 3 }))

	for (const file of events) {
		const event = await import((`${EVENTS_DIR}/${file}`));
		ws.on(file.split('.')[0], (eventData) => event.default(ws, eventData));
	}

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});