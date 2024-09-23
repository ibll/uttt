import fs from 'fs';
import path from 'path';

const __dirname = import.meta.dirname;
const MESSAGES_DIR = '../messages';

export default async (ws, data) => {
	try {
		let payload = JSON.parse(data)
		if (!payload.type) return;

		const filePath = path.join(__dirname, MESSAGES_DIR,  payload.type + '.js');
		fs.readFile(filePath, (err) => {
			if (err) return console.error(`Message type '${payload.type}' not found`);
			import(filePath)
				.then(module => module.default(ws, payload))
				.catch(err => console.error(err));
		});
	} catch {
		console.error(`Couldn't parse message:\n${data}`);
	}
}