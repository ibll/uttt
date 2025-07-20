import { games } from '../../uttt.js';

export default async (ws, payload) => {
  const game_id = payload.game_id;
  const cell_num = parseInt(payload.cell_num)

  games[game_id]?.place(ws, 0, cell_num);
}
