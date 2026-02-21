import type { FC } from "react";
import type { ModalState } from "@/store/slices/modal";
import styled from "styled-components";
import { AnimatePresence as AP, motion as m } from "framer-motion";
import Flex from "../Flex";
import { useActions } from "@/hooks/useActions";
import Block from "../Block";

interface ModalWrapperProps {
	$name: keyof ModalState;
	$isActive: boolean;
	$isDefaultContent?: boolean;
	$fadeColor?: string;
	children: React.ReactNode;
}

const Modal = styled(m.div)<Pick<ModalWrapperProps, "$fadeColor">>`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 9;
	background-color: ${({ $fadeColor }) => ($fadeColor ? $fadeColor : "rgba(22, 23, 25, 0.75)")};
	overflow: auto;
	overscroll-behavior: contain;
`;

const ModalBody = styled(Flex)`
	min-height: 100%;
	padding: 20px;
`;

const ModalWrapper: FC<ModalWrapperProps> = ({ $name, $isActive, $isDefaultContent, $fadeColor, children }) => {
	const { setModalVisibility } = useActions();

	const transitions = {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
	};

	return (
		<AP>
			{$isActive && (
				<Modal $fadeColor={$fadeColor} {...transitions} onClick={() => setModalVisibility({ name: $name, isVisible: false })}>
					<ModalBody $justifyContent="center" $alignItems="center">
						{$isDefaultContent ? (
							<div onClick={(event: React.MouseEvent) => event.stopPropagation()}>{children}</div>
						) : (
							<Block
								onClick={(event: React.MouseEvent) => event.stopPropagation()}
								$borderRadius={20}
								$padding={20}
								$bgc="black800"
							>
								{children}
							</Block>
						)}
					</ModalBody>
				</Modal>
			)}
		</AP>
	);
};

export default ModalWrapper;
