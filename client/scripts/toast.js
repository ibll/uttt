const default_fade_times = 250;
const default_fade_stages = 10;

let toast_element;
let displayed_message;
let display_queue;

let remove_timeout;
let fade_timeout;

document.addEventListener("DOMContentLoaded", function() {
	toast_element = document.getElementById('toast');

	toast_element.addEventListener("click", function() {
		toast_API.display();
	});

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
		glitchOut(100);
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
	const minSlice = Math.max(0, randomIndex - Math.floor(remainingMessage.length / default_fade_stages));
	const maxSlice = Math.min(remainingMessage.length, randomIndex + Math.floor(remainingMessage.length / default_fade_stages));

	return remainingMessage.slice(0, minSlice) + remainingMessage.slice(maxSlice + 1);
}

function glitchIn(message) {
	let remainingMessage = message;
	let stages = [];

	stages[0] = '';

	for (let i = default_fade_stages - 1; i > 0; i--) {
		stages[i] = remainingMessage;
		remainingMessage = clipMessage(remainingMessage);
	}

	const timeout = Math.floor(default_fade_times / default_fade_stages);

	glitchInStep(stages, 0, timeout);
}

function glitchInStep(stages, stage, timeout) {
	if (stage >= default_fade_stages) return;

	toast_element.innerHTML = stages[stage];

	fade_timeout = setTimeout(() => {
		glitchInStep(stages, stage + 1, timeout);
	}, timeout);
}

function glitchOut(time) {
	let fade_time = time || default_fade_times;
	let remainingMessage = toast_element.innerHTML;
	let stages = [];

	stages[default_fade_stages - 1] = '';

	for (let i = 0; i < default_fade_stages - 1; i++) {
		stages[i] = remainingMessage;
		remainingMessage = clipMessage(remainingMessage);
	}

	const timeout = Math.floor(fade_time / default_fade_stages);

	glitchOutStep(stages, 0, timeout);
}

function glitchOutStep(stages, stage, timeout) {
	if (stage >= default_fade_stages) return;

	toast_element.innerHTML = stages[stage];

	fade_timeout = setTimeout(() => {
		glitchOutStep(stages, stage + 1, timeout);
	}, timeout);
}

export default toast_API;
window.toast = toast_API;