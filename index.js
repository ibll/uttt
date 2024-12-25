import http from 'http';
import https from 'https';
import fs from 'fs';
import loadStatic  from "./server/load_static.js";
import {createWSS} from "./server/wss.js";

const cert_dir = `/etc/letsencrypt/live`;
const domain = `uttt.ibll.dev`;
let options;

try {
	options = {
		key: fs.readFileSync(`${cert_dir}/${domain}/privkey.pem`),
		cert: fs.readFileSync(`${cert_dir}/${domain}/fullchain.pem`)
	}
} catch {
	console.error(`Could not find certificates for ${domain}, disabling HTTPS.`);
}

const http_server = http.createServer(loadStatic)
createWSS(http_server);

let https_server;
if (options) {
	https_server = https.createServer(options, loadStatic);
	createWSS(https_server);
}


http_server.listen(process.env.PORT || 80, () => {
	console.log(`HTTP server running on port ${process.env.PORT || 80}`);
});

https_server?.listen(process.env.PORT || 443, () => {
	console.log(`HTTPS server running on port ${process.env.PORT || 443}`);
});
