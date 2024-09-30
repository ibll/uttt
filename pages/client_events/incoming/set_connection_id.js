import Cookies from '../../modules/js.cookie.mjs';
import { connection_id } from '../../client.js';

export default async (ws, payload) => {
	console.log(`Client joined with id: ${ payload.connection_id}`);
	Cookies.set('connection_id', payload.connection_id);
	connection_id = payload.connection_id;
}