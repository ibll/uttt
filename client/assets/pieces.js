export let pieces = {};
pieces.cross = `
		<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="5" y="18" width="18.3137" height="250" rx="9.15685" transform="rotate(-45 5 18)" fill="var(--red)"/>
			<rect x="182" y="5" width="18.3137" height="250" rx="9.15685" transform="rotate(45 182 5)" fill="var(--red)"/>
		</svg>
	`
pieces.nought = `
		<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clip-path="url(#clip0_2_2)">
				<circle cx="100" cy="100" r="93" stroke="var(--blue)" stroke-width="14"/>
			</g>
			<defs>
				<clipPath id="clip0_2_2">
					<rect width="200" height="200" fill="white"/>
				</clipPath>
			</defs>
		</svg>
	`
pieces.dash = `
	<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect x="5" y="109" width="18" height="190" rx="9" transform="rotate(-90 5 109)" fill="var(--grey)"/>
	</svg>
	`