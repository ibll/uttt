import Cookies from "../modules/js.cookie.mjs";

export default async (ws, payload) => {
	console.log(`Client joined with id: ${ payload.connection_id}`);
	Cookies.set('connection_id', payload.connection_id);
}