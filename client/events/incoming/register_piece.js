import { game_id, setPiece } from "../../scripts/uttt.js";

export default async (ws, payload) => {
  if (payload.game_id !== game_id) return;
  setPiece(payload.piece);
}
