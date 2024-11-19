import {setPiece} from "../../scripts/uttt.js";

export default async (ws, payload) => {
	setPiece(payload.piece);
}