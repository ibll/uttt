import { place } from '../uttt.js';

export default async (ws, payload) => {
	place(payload.cell_num, payload.player);
}