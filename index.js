import https from 'https';
import fs from 'fs';
import loadStatic  from "./server/load_static.js";
import {createWSS} from "./server/wss.js";

const cert_dir = `/etc/letsencrypt/live`;
const domain = `uttt.ibll.dev`;
const options = {
	key: fs.readFileSync(`${cert_dir}/${domain}/privkey.pem`),
	cert: fs.readFileSync(`${cert_dir}/${domain}/fullchain.pem`)
}

const server = https.createServer(options, loadStatic);

export const wss = createWSS(server);

const PORT = process.env.PORT || 443;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
