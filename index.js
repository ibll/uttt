import http from 'http';
import loadStatic from "./server/load_static.js";
import { createWSS } from "./server/wss.js";
import { createTCS } from "./server/tcs.js";
import { pruneOldGames } from "./server/uttt.js";
import cron from "node-cron"

export const domain = `uttt.ibll.dev`;

const http_server = http.createServer(loadStatic)
createWSS(http_server);
const tcs = createTCS();

const defaultPort = 3000;
http_server.listen(process.env.PORT || defaultPort, () => {
  console.log(`HTTP server running on port ${process.env.PORT || defaultPort}`);
});

tcs.listen(3001, () => {
  console.log(`TCP server running on port 3001`)
})

tcs.on('error', (err) => {
  console.error('Server error:', err);
});

cron.schedule('0 * * * *', pruneOldGames);
