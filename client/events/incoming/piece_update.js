import { place, setActiveGrids, setMoves, game_id } from '../../scripts/uttt.js';

export default async (ws, payload) => {
	const room = payload.room;
	const pieces = payload.pieces;
	const next_piece = payload.next_piece;
	const active_grids = payload.active_grids;
	const moves = payload.moves;

	if (room !== game_id) return;

	pieces.forEach((piece) => {
		place(piece.cell_layer, piece.cell_number, piece.piece);
	});
	setActiveGrids(active_grids, next_piece);
	setMoves(moves);
}