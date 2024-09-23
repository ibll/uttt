const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
	console.log('Connected to server');
};

ws.onmessage = (event) => {
	console.log('Message from server:', event.data);

	const message = document.createElement('div');
	message.textContent = event.data;
	document.body.appendChild(message);
};

ws.onclose = () => {
	console.log('Disconnected from server');
};

function send(json) {
	ws.send(JSON.stringify(json));
}

function increment(amount) {
	send({type: 'increment', by: amount});
}