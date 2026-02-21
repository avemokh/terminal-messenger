import { createGlobalStyle } from "styled-components";
import { palette } from "./colorPalette";

const GlobalStyle = createGlobalStyle`
	.wrapper {
		background-color: ${palette.black900};
		min-height: 100%;
		padding: 20px;
		color: ${palette.white900}
	}

	.icon {
		path[fill],circle[fill],rect[fill],line[fill],polygon[fill] {
			fill: currentColor
		}
	}
	.icon [stroke] {
		stroke: currentColor;
	}
`;

export default GlobalStyle;
