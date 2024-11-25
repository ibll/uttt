let status_bar_element = document.getElementById('status-bar');

const status_bar_API = {}

document.addEventListener("DOMContentLoaded", function() {
	status_bar_element = document.getElementById('status-bar');
});

status_bar_API.reset = () => {
	const status_bar = document.getElementById('status-bar');
	status_bar.classList.remove('active')
	status_bar.innerHTML = '';
}

status_bar_API.setActive = (bool) => {
	if (bool) status_bar_element.classList.add('active');
	else status_bar_element.classList.remove('active');
}

status_bar_API.addBlock = (id, label, value, func, ...args) => {
	const status_bar = document.getElementById('status-bar');
	const status_block = document.createElement(func ? 'button' : 'div');

	status_block.id = id;
	status_block.classList.add('status-block');
	if (func) status_block.addEventListener('click', () => func(...args));

	status_block.innerHTML = `
		<p class="status-label">${label}</p>
		<p class="status-value">${value}</p>
	`;

	status_bar.appendChild(status_block);
	return status_bar;
}


status_bar_API.updateBlock = (id, value) => {
	const element = document.getElementById(id);
	if (!element) return;
	const valueElement = element.querySelector('.status-value');
	if (!valueElement) return;
	valueElement.textContent = value;
}

export default status_bar_API;