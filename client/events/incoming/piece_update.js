import { place, setActiveGrids, setMoves, game_id } from '../../scripts/uttt.js';

export default async (ws, payload) => {
  const pieces = payload.pieces;
  const next_piece = payload.next_piece;
  const moves = payload.moves;

  if (payload.game_id != game_id) return;

  pieces.forEach((piece) => {
    place(piece.cell_layer, piece.cell_number, piece.piece);
  });
  setActiveGrids(payload.active_layer, payload.active_grid_num, next_piece);
  setMoves(moves);
}
