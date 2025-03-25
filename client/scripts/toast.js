import {icons} from "../assets/icons.js";

const DEFAULT_DURATION = 5000;
const DEFAULT_FADE_TIME = 500;
const DEFAULT_FADE_STAGES = 10;
const TOO_FEW_STAGES_TO_ANIMATE = 4;

let toast_element;
let toast_icon;
let toast_text;
let displayed_message;
let queued_toast;

let last_anim = Date.now();

let remove_timeout;
let fade_timeout;

document.addEventListener("DOMContentLoaded", function () {
	toast_element = document.getElementById('toast');
	toast_icon = document.getElementById('toast-icon');
	toast_text = document.getElementById('toast-text');

	toast_element.addEventListener("click", function () {
		toast_API.display();
	});

	if (queued_toast) toast_API.display(queued_toast.message, queued_toast.duration, queued_toast.icon, queued_toast.force_retrigger);
});

const toast_API = {}

toast_API.display = function (message, duration, icon, force_retrigger) {
	duration = duration || DEFAULT_DURATION;

	if (!toast_element) return queued_toast = {
		message,
		duration,
		icon,
		force_retrigger
	};

	if (remove_timeout) clearTimeout(remove_timeout);
	if (fade_timeout) clearTimeout(fade_timeout);

	if (icon)
		toast_icon.innerHTML = icons[icon];
	else
		toast_icon.innerHTML = '';

	if (!message) {
		toast_element.classList.remove('active');
		displayed_message = undefined;
		glitchOut(100);
		return;
	}

	if (displayed_message !== message || force_retrigger) {
		displayed_message = message;

		let fade_time = DEFAULT_FADE_TIME;
		let fade_stages = DEFAULT_FADE_STAGES;
		let now = Date.now();
		let difference = now - last_anim;
		let quick_speed = 3000


		if (difference < quick_speed) {
			fade_time = Math.max(Math.ceil((difference / quick_speed) * DEFAULT_FADE_TIME), 1);
			fade_stages = Math.max(Math.ceil((difference / quick_speed) * DEFAULT_FADE_STAGES), 1);
		}

		console.log(fade_time, fade_stages);

		glitchIn(message, fade_time, fade_stages);
		toast_element.classList.add('active');

		last_anim = Date.now();
	}

	if (duration === Infinity) return;

	remove_timeout = setTimeout(() => {
		toast_element.classList.remove('active');
		displayed_message = undefined;
		glitchOut();
	}, duration);
}

function clipMessage(remainingMessage, num_stages) {
	const randomIndex = Math.floor(Math.random() * remainingMessage.length);
	const minSlice = Math.max(0, randomIndex - Math.floor(remainingMessage.length / num_stages));
	const maxSlice = Math.min(remainingMessage.length, randomIndex + Math.floor(remainingMessage.length / num_stages));

	return remainingMessage.slice(0, minSlice) + remainingMessage.slice(maxSlice + 1);
}

function glitchIn(message, fade_time, fade_stages) {
	const time = fade_time || DEFAULT_FADE_TIME;
	const num_stages = fade_stages || DEFAULT_FADE_STAGES;
	let remainingMessage = message;
	let stages = [];

	if (num_stages < TOO_FEW_STAGES_TO_ANIMATE) {
		toast_text.innerHTML = message;
		return;
	}

	stages[0] = '';

	for (let i = DEFAULT_FADE_STAGES - 1; i > 0; i--) {
		stages[i] = remainingMessage;
		remainingMessage = clipMessage(remainingMessage, DEFAULT_FADE_STAGES);
	}

	const timeout = Math.floor(time / num_stages);

	glitchInStep(stages, DEFAULT_FADE_STAGES - num_stages, DEFAULT_FADE_STAGES, timeout);
}

function glitchInStep(stages, stage, num_stages, timeout) {
	if (stage >= num_stages) {
		last_anim = Date.now();
		return;
	}

	if (stages[stage] !== '')
		toast_text.innerHTML = stages[stage];

	console.log(stages[stage]);

	clearTimeout(fade_timeout);
	fade_timeout = setTimeout(() => {
		glitchInStep(stages, stage + 1, num_stages, timeout);
	}, timeout);
}

function glitchOut(fade_time, fade_stages) {
	let time = fade_time || DEFAULT_FADE_TIME;
	let num_stages = fade_stages || DEFAULT_FADE_STAGES;
	let remainingMessage = toast_text.innerHTML;
	let stages = [];

	if (num_stages < TOO_FEW_STAGES_TO_ANIMATE) {
		toast_text.innerHTML = '';
		return;
	}

	stages[num_stages - 1] = '';

	for (let i = 0; i < DEFAULT_FADE_STAGES - 1; i++) {
		stages[i] = remainingMessage;
		remainingMessage = clipMessage(remainingMessage, DEFAULT_FADE_STAGES);
	}

	const timeout = Math.floor(time / num_stages);

	glitchOutStep(stages, DEFAULT_FADE_STAGES - num_stages, DEFAULT_FADE_STAGES, timeout);
}

function glitchOutStep(stages, stage, num_stages, timeout) {
	if (stage >= num_stages) return;

	toast_text.innerHTML = stages[stage];

	clearTimeout(fade_timeout)
	fade_timeout = setTimeout(() => {
		glitchOutStep(stages, stage + 1, num_stages, timeout);
	}, timeout);
}

export default toast_API;
window.toast = toast_API;