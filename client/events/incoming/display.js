import status from "../../scripts/toast.js";

export default async (ws, payload) => {
	status.display(`${ payload.content}`, 5000, true);
}