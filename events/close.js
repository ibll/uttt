export default async (ws) => {
	console.log(`Client disconnected: ${ ws.connection_id}`);
}