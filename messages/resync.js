import { prepareClient} from "../index.js";

export default async (ws, payload) => {
	console.error(`Error from ${ws.connection_id}: ${payload.error}`);
	prepareClient(ws);
}