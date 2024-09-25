import { place } from '../uttt.js';

export default async (ws, payload) => {
	place(payload.cell_id, ws.connection_id);
}