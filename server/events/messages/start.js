import { start } from '../../uttt.js';

export default async (ws, payload) => {
	const size = parseInt(payload.size);
	start(size);
}