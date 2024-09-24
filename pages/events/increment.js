export default async (ws, payload) => {
	const number = document.createElement('div');
	number.textContent = payload.value;
	document.body.appendChild(number);
}