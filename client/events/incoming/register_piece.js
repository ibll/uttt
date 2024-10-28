import { pieces } from '../../assets/pieces.js';

export default async (ws, payload) => {
	document.getElementById('piece-marker').innerHTML = pieces[payload.piece];
}