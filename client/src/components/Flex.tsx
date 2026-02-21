import type { ReactNode } from "react";
import styled from "styled-components";

interface FlexProps {
	$wrap?: boolean;
	$column?: boolean;
	$reverse?: boolean;
	$alignItems?: "flex-start" | "flex-end" | "center" | "baseline";
	$alignSelf?: "flex-start" | "flex-end" | "center" | "baseline";
	$justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
	$gap?: number | string | [number | string, number | string];
	$itemsInRow?: number;
	children?: ReactNode;
}

const getGapValue = (gap: string | number) => {
	return typeof gap === "string" ? gap : gap + "px";
};

const calculateChildrenSize = (itemsInRow: number, gap: FlexProps["$gap"]) => {
	const gapSize = gap ? (Array.isArray(gap) ? gap[0] : typeof gap === "string" ? gap.slice(4) : gap) : 0;

	return `calc(100%/${itemsInRow} - (${getGapValue(gapSize)}/${itemsInRow} - ${getGapValue(gapSize)}))`;
};

const Flex = styled.div<FlexProps>`
	display: flex;

	${({ $wrap }) => $wrap && "flex-wrap-wrap"};

	${({ $column, $reverse }) =>
		($column || $reverse) && `flex-direction: ${$column ? "column" : "row"}${$reverse ? "-reverse" : ""}`};

	${({ $alignItems }) => $alignItems && `align-items: ${$alignItems}`};

	${({ $alignSelf }) => $alignSelf && `align-self: ${$alignSelf}`};

	${({ $justifyContent }) => $justifyContent && `justify-content: ${$justifyContent}`};

	${({ $gap }) =>
		$gap &&
		(Array.isArray($gap)
			? `column-gap: ${getGapValue($gap[0])}; row-gap: ${getGapValue($gap[1])}`
			: `gap: ${getGapValue($gap)}`)};

	${({ $itemsInRow, $gap }) =>
		$itemsInRow &&
		`
		& > * {
			flex: 0 0 ${calculateChildrenSize($itemsInRow, $gap)};
		}
	`}
`;

export default Flex;
