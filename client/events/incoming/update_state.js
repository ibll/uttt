import { updateState } from '../../scripts/uttt.js';

export default async (ws, payload) => {
  updateState(payload);
}
