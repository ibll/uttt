import Cookies from '../../modules/js.cookie.mjs';
import { setConnectionID } from '../../client.js';

export default async (ws, payload) => {
	console.log(`Client joined with id: ${ payload.connection_id}`);
	Cookies.set('connection_id', payload.connection_id);
	setConnectionID(payload.connection_id);
}