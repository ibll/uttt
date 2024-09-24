const host = window.location.hostname;
const port = window.location.port;
const ws = new WebSocket(`ws://${host}:${port}`);

ws.onopen = () => {
	console.log('Connected to server');
};

ws.onclose = () => {
	console.log('Disconnected from server');
};

ws.onmessage = (event) => {
	try {
		const payload = JSON.parse(event.data);
		const events = ['create_board', 'increment', 'log', 'set_connection_id']
		if (events.includes(payload.type)) {
			import(`./events/${payload.type}.js`)
				.then((event) => {
					event.default(ws, payload);
				});
		}

	} catch {
		console.error('Invalid JSON:', event.data);
	}
};

document.getElementById("increment").addEventListener("click", () => {
	ws.send(JSON.stringify({type: "increment", by: 1}));
});