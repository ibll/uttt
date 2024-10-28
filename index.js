import http from 'http';
import loadStatic  from "./server/load_static.js";
import {createWSS} from "./server/wss.js";

const server = http.createServer(loadStatic);

export const wss = createWSS(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});