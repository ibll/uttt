import Cookies from '../../modules/js.cookie.mjs';
import { setConnectionID } from '../../client.js';

export default async (ws, payload) => {
	Cookies.set('connection_id', payload.connection_id, { expires: 7 });
	setConnectionID(payload.connection_id);
}