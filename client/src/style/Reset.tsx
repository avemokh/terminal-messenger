import { createGlobalStyle } from "styled-components";

const ResetStyle = createGlobalStyle`
	*, *::before, &::after {
		box-sizing: border-box;
		-webkit-tap-highlight-color: transparent;
	}

	* {
		padding: 0;
		margin: 0;
		border: 0;
		outline: 0;
	}

	html, body {
		height: 100%;
		line-height: 1;
		font-size: 14px;
		font-family: ${import.meta.env.VITE_PRIMARY_FONT};
		scroll-behavior: smooth;
	}

	ul, ol {
		list-style: none;
	}

	html:focus-within {
		scroll-behavior: smooth;
	}

	button {
		cursor: pointer;
		background-color: transparent;
	}

	button, input, textarea, select {
		font: inherit;
	}
	
	h1, h2, h3, h4, h5, h6 {
		font-size: inherit;
		font-weight: 700;
	}

	a {
		text-decoration: none;
		text-decoration-skip-ink: auto;
	}

	img, picture, svg, video, canvas {
		max-width: 100%;
		height: auto;
		background-repeat: no-repeat;
		background-size: cover;
		vertical-align: middle;
		font-style: italic;
	}

	@media (prefers-reduced-motion: reduce) {
		html:focus-within {
			scroll-behavior: auto;
		}
		*, *::before, *::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
			scroll-behavior: auto !important;
			transition: none;
		}
	}
`;

export default ResetStyle;
