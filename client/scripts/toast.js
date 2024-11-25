const fade_times = 250;
const fade_stages = 10;

let toast_element;
let displayed_message;
let display_queue;

let remove_timeout;
let fade_timeout;

document.addEventListener("DOMContentLoaded", function() {
	toast_element = document.getElementById('toast');
	if (display_queue) toast_API.display(display_queue);
});

const toast_API = {}

toast_API.display = function(message, length, force_retrigger) {
	if (!length) length = 5000;
	if (!toast_element) return display_queue = message;

	if (remove_timeout) clearTimeout(remove_timeout);
	if (fade_timeout) clearTimeout(fade_timeout);

	if (!message) {
		toast_element.classList.remove('active');
		displayed_message = undefined;
		glitchOut();
		return;
	}

	if (displayed_message !== message || force_retrigger) {
		displayed_message = message;
		glitchIn(message);
		toast_element.classList.add('active');
	}

	if (length === Infinity) return;

	remove_timeout = setTimeout(() => {
		toast_element.classList.remove('active');
		displayed_message = undefined;
		glitchOut();
	}, length);
}

function clipMessage(remainingMessage) {
	const randomIndex = Math.floor(Math.random() * remainingMessage.length);
	const minSlice = Math.max(0, randomIndex - Math.floor(remainingMessage.length / fade_stages));
	const maxSlice = Math.min(remainingMessage.length, randomIndex + Math.floor(remainingMessage.length / fade_stages));

	return remainingMessage.slice(0, minSlice) + remainingMessage.slice(maxSlice + 1);
}

function glitchIn(message) {
	let remainingMessage = message;
	let stages = [];

	stages[0] = '';

	for (let i = fade_stages - 1; i > 0; i--) {
		stages[i] = remainingMessage;
		remainingMessage = clipMessage(remainingMessage);
	}

	const timeout = Math.floor(fade_times / fade_stages);

	glitchInStep(stages, 0, timeout);
}

function glitchInStep(stages, stage, timeout) {
	if (stage >= fade_stages) return;

	toast_element.innerHTML = stages[stage];

	fade_timeout = setTimeout(() => {
		glitchInStep(stages, stage + 1, timeout);
	}, timeout);
}

function glitchOut() {
	let remainingMessage = toast_element.innerHTML;
	let stages = [];

	stages[fade_stages - 1] = '';

	for (let i = 0; i < fade_stages - 1; i++) {
		stages[i] = remainingMessage;
		remainingMessage = clipMessage(remainingMessage);
	}

	const timeout = Math.floor(fade_times / fade_stages);

	glitchOutStep(stages, 0, timeout);
}

function glitchOutStep(stages, stage, timeout) {
	if (stage >= fade_stages) return;

	toast_element.innerHTML = stages[stage];

	fade_timeout = setTimeout(() => {
		glitchOutStep(stages, stage + 1, timeout);
	}, timeout);
}

export default toast_API;