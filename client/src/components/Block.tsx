import styled from "styled-components";
import Flex from "./Flex";
import { palette } from "@/style/colorPalette";

type BorderSide = "top" | "left" | "bottom" | "right" | "vertical" | "horizontal";

const validateBorderSides = (sides: BorderSide[]): boolean => {
	const hasVertical = sides.includes("vertical");
	const hasHorizontal = sides.includes("horizontal");
	const hasTop = sides.includes("top");
	const hasBottom = sides.includes("bottom");
	const hasLeft = sides.includes("left");
	const hasRight = sides.includes("right");

	if (hasVertical && (hasTop || hasBottom)) {
		console.warn("Block: нельзя указать 'vertical' вместе с 'top' или 'bottom'");
		return false;
	}

	if (hasHorizontal && (hasLeft || hasRight)) {
		console.warn("Block: нельзя указать 'horizontal' вместе с 'left' или 'right'");
		return false;
	}

	return true;
};

interface BlockProps {
	$padding?: string | number | [string | number, (string | number)?, (string | number)?, (string | number)?];
	$margin?: string | number | [string | number, (string | number)?, (string | number)?, (string | number)?];
	$borderRadius?: number;
	$border?: string;
	$borderSides?: BorderSide[];
	$bgc?: keyof typeof palette;
}

const Block = styled(Flex)<BlockProps>`
	${({ $padding }) =>
		$padding &&
		`padding: ${typeof $padding === "number" ? $padding + "px" : typeof $padding === "string" ? $padding : $padding.map((value) => (typeof value === "string" ? value : value + "px")).join(" ")}`};
	${({ $margin }) =>
		$margin &&
		`margin: ${typeof $margin === "number" ? $margin + "px" : typeof $margin === "string" ? $margin : $margin.map((value) => (typeof value === "string" ? value : value + "px")).join(" ")}`};
	${({ $borderRadius }) => $borderRadius && `border-radius: ${$borderRadius}px`};
	${({ $border, $borderSides }) => {
		if (!$border) return "";

		if ($borderSides) {
			validateBorderSides($borderSides);

			const expandedSides = new Set<string>();

			$borderSides.forEach((side) => {
				switch (side) {
					case "vertical":
						expandedSides.add("top");
						expandedSides.add("bottom");
						break;
					case "horizontal":
						expandedSides.add("left");
						expandedSides.add("right");
						break;
					default:
						expandedSides.add(side);
				}
			});

			return Array.from(expandedSides)
				.map((side) => `border-${side}: ${$border}`)
				.join(";");
		}

		return `border: ${$border}`;
	}};
	${({ $bgc }) => $bgc && `background-color: ${palette[$bgc]}`};
`;

export default Block;
