import { place } from '../uttt.js';

export default async (ws, payload) => {
	place(payload.cell_layer, payload.cell_number, payload.player);
}