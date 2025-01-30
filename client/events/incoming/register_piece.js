import {game_id, setPiece} from "../../scripts/uttt.js";

export default async (ws, payload) => {
	if (payload.room !== game_id) return;
	setPiece(payload.piece);
}