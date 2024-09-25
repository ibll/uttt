import { start } from '../uttt.js';

export default async (ws, payload) => {
	const depth = payload.depth;
	start(depth);
}