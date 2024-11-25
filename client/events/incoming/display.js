import status from "../../scripts/toast.js";

export default async (ws, payload) => {
	status.display(`Server: ${ payload.content}`);
}