let value= 0;

export default async (ws, payload) => {
	let increment =  1;
	if (payload.by) increment = Number.parseInt(payload.by);

	console.log(`${ws.id} incremented by ${payload.by}`);

	value += increment;
	ws.send(value);
}