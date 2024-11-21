import status from "../../scripts/status.js";

export default async (ws, payload) => {
	status.display(`Server: ${ payload.content}`);
}