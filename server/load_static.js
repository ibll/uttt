import fs from 'fs';
import path from 'path';
import mime from 'mime';

const __dirname = import.meta.dirname;
const client_dir = path.resolve(__dirname, '../client');

export default function loadStatic(req, res) {
	const filePath = path.join(client_dir, req.url === '/' ? 'index.html' : req.url);
	let contentType = mime.getType(filePath) || 'text/html';

	fs.readFile(filePath, (err, content) => {
		if (err) {
			const errorPage = err.code === 'ENOENT' ? '404.html' : '500.html';
			const statusCode = err.code === 'ENOENT' ? 404 : 500;
			fs.readFile(path.join(client_dir, errorPage), (error, errorContent) => {
				res.writeHead(statusCode, { 'Content-Type': 'text/html' });
				res.end(errorContent || `Server Error: ${err.code}`, 'utf-8');
			});
		} else {
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(content, 'utf-8');
		}
	});
}