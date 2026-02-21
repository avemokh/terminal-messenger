import type { FC } from "react";
import styled from "styled-components";
import Block from "./Block";
import { palette } from "@/style/colorPalette";

interface ButtonProps {
	icon?: React.ReactNode;
	children?: React.ReactNode;
	variant?: "primary" | "danger" | "common";
	onClick?: () => void;
}

const StyledButton = styled(Block).attrs({ as: "button" })<{ $hasChildren: boolean } & Pick<ButtonProps, "variant">>`
	height: 53px;
	min-width: 53px;
	color: ${palette.white900};
	font-size: 16px;
	transition: 350ms;
	background-color: ${({ variant }) =>
		variant === "primary"
			? palette.primary
			: variant === "danger"
				? palette.danger
				: variant === "common"
					? palette.gray500
					: palette.primary};

	svg {
		width: ${({ $hasChildren }) => ($hasChildren ? "20px" : "32px")};
	}

	@media (hover: hover) and (pointer: fine) {
		&:hover {
			background-color: ${({ variant }) =>
				variant === "primary"
					? palette.primaryDark
					: variant === "danger"
						? palette.dangerDark
						: variant === "common"
							? palette.gray700
							: palette.primaryDark};
		}
	}

	&:active {
		translate: 0 2px;
		background-color: ${({ variant }) =>
			variant === "primary"
				? palette.primaryDarker
				: variant === "danger"
					? palette.dangerDarker
					: variant === "common"
						? palette.gray900
						: palette.primaryDarker};
	}
`;

const Button: FC<ButtonProps> = ({ icon, children, onClick, variant }) => {
	return (
		<StyledButton
			$hasChildren={Boolean(children)}
			$justifyContent="center"
			$gap={4}
			variant={variant}
			$padding={!Boolean(children) ? 0 : [0, 20]}
			$borderRadius={8}
			$alignItems="center"
			onClick={onClick}
		>
			{icon}
			{children}
		</StyledButton>
	);
};

export default Button;
