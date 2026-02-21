import { useAppSelector } from "@/hooks/useAppSelector";
import type { FC } from "react";
import ModalWrapper from "./ModalWrapper";

const AuthModal: FC = () => {
	const { auth: isActive } = useAppSelector((state) => state.modal);

	return (
		<ModalWrapper $isActive={isActive} $name="auth">
			AuthModal
		</ModalWrapper>
	);
};

export default AuthModal;
