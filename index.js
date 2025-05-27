import http from 'http';
import loadStatic from "./server/load_static.js";
import { createWSS } from "./server/wss.js";
import { pruneOldGames } from "./server/uttt.js";
import cron from "node-cron"

export const domain = `uttt.ibll.dev`;

const http_server = http.createServer(loadStatic)
createWSS(http_server);

const defaultPort = 3000;
http_server.listen(process.env.PORT || defaultPort, () => {
  console.log(`HTTP server running on port ${process.env.PORT || defaultPort}`);
});

cron.schedule('0 * * * *', pruneOldGames);
