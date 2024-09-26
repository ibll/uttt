import { place } from '../uttt.js';

export default async (ws, payload) => {
	console.log(payload);
	place(payload.layer, payload.cell_num, payload.player);
}