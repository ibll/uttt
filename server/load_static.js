import fs from 'fs';
import path from 'path';
import mime from 'mime';
import url from 'url';
import { domain } from '../index.js';
import { games } from './uttt.js';

const __dirname = import.meta.dirname;
const client_dir = path.resolve(__dirname, '../client');

export default function loadStatic(req, res) {
	const parsed_url = url.parse(req.url, true);
	const filePath = path.join(client_dir, parsed_url.pathname === '/' ? 'index.html' : parsed_url.pathname);
	let contentType = mime.getType(filePath) || 'text/html';

	fs.readFile(filePath, (err, content) => {
		if (err) {
			const errorPage = err.code === 'ENOENT' ? '404.html' : '500.html';
			const statusCode = err.code === 'ENOENT' ? 404 : 500;
			fs.readFile(path.join(client_dir, errorPage), (error, errorContent) => {
				res.writeHead(statusCode, { 'Content-Type': 'text/html' });
				res.end(errorContent || `Server Error: ${err.code}`, 'utf-8');
			});

			return;
		}

		const headers = { 'Content-Type': contentType };

		if (contentType.startsWith('image/')) {
			headers['Cache-Control'] = 'public, max-age=31536000';
		}

		res.writeHead(200, headers);

		let output = content;

		if (parsed_url.pathname === '/') {
			output = output.toString();

			if (games.hasOwnProperty(parsed_url.query['room'])) {
				output = output.replace(
					'<meta property="og:title" content="Ultimate Tic-Tac-Toe"/>',
					`<meta property="og:title" content="${parsed_url.query['room'] ? `Join room '${parsed_url.query['room']}' in Ultimate Tic-Tac-Toe!` : 'Ultimate Tic-Tac-Toe'}"/>`
				);
			}

			output = output.replace(
				'<meta property="og:image" content="./assets/og-image.png"/>',
				`<meta property="og:image" content="https://${domain}/assets/og-image.png"/>`
			)

			output = output.replace(
				'<meta property="twitter:image" content="./assets/og-image.png"/>',
				`<meta property="twitter:image" content="https://${domain}/assets/og-image.png"/>`
			)
		}

		res.end(output, 'utf-8');
	});
}