import http from 'http';
import loadStatic from "./server/load_static.js";
import {createWSS} from "./server/wss.js";
import {pruneOldGames} from "./server/uttt.js";
import cron from "node-cron"

export const domain = `uttt.ibll.dev`;

const http_server = http.createServer(loadStatic)
createWSS(http_server);

http_server.listen(process.env.PORT || 3000, () => {
	console.log(`HTTP server running on port ${process.env.PORT || 3000}`);
});

cron.schedule('0 * * * *', pruneOldGames);