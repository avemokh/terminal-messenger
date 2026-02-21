import { createContext, useContext, useState, type FC } from "react";
import styled from "styled-components";
import Block from "./Block";
import { palette } from "@/style/colorPalette";
import { AnimatePresence as AP, motion as m } from "framer-motion";
import Flex from "./Flex";
import { Icon } from "./Icon";

interface InputError {
	isError: boolean;
	message: string;
}

interface InputContextType {
	error?: InputError;
}

const InputContext = createContext<InputContextType>({});

interface BaseFieldProps {
	value: string;
	placeholder?: string;
	icon?: React.ReactNode;
	name?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
}

interface InputProps {
	width?: string;
	error?: InputError;
	children: React.ReactNode;
}

interface InputTextProps extends BaseFieldProps {
	type?: "text";
}
interface InputPasswordProps extends BaseFieldProps {
	type?: "password";
	showToggle?: boolean;
}

interface InputContextProps {
	isFocused: boolean;
	isError?: boolean;
	hasValue: boolean;
}

const InputStateContext = createContext<InputContextProps>({
	isFocused: false,
	isError: false,
	hasValue: false,
});

const InputWrapper = styled(Flex)<{ $width?: string }>`
	width: ${({ $width }) => ($width ? $width : "auto")};
`;

const InputContainer = styled(Block)`
	position: relative;
	z-index: 1;
`;

const ErrorMessage = styled(Block)`
	width: 100%;
	line-height: 1.25;
	white-space: break-spaces;
	color: ${palette.white800};
`;

const StyledInput = styled.input<{ $isFocused: boolean; $isError?: boolean; $paddingRight?: string }>`
	background-color: ${palette.gray900};
	border-radius: 8px;
	padding: 13px ${({ $paddingRight }) => $paddingRight} 15px 46px;
	color: ${palette.white900};
	font-weight: 400;
	transition: 250ms;
	font-size: 16px;
	width: 100%;
	border: 2px solid ${({ $isError }) => ($isError ? palette.danger : "transparent")};
	&::placeholder {
		transition: 100ms;
		color: ${palette.gray100};
	}
	&:focus::placeholder {
		opacity: 0;
		visibility: hidden;
	}
	&:focus {
		border-color: ${({ $isError }) => ($isError ? palette.danger : palette.primary)};
	}
`;

const IconContainer = styled.div<{ $isFocused: boolean; $isError?: boolean }>`
	position: absolute;
	left: 20px;
	top: 50%;
	translate: 0 -50%;
	transition: 250ms;
	color: ${({ $isFocused, $isError }) => ($isError ? palette.danger : $isFocused ? palette.primary : palette.gray100)};

	svg {
		width: 16px;
		height: 16px;
	}
`;

const BaseInput: FC<{
	type?: string;
	value: string;
	placeholder?: string;
	icon?: React.ReactNode;
	name?: string;
	showToggle?: boolean;
	onChange: (value: string) => void;
	onBlur?: () => void;
}> = ({ type = "text", value, name, placeholder, showToggle, icon, onChange, onBlur }) => {
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const { error } = useContext(InputContext);

	const inputType = type === "password" && showPassword ? "text" : type;

	const handleFocus = () => setIsFocused(true);
	const handleBlur = () => {
		setIsFocused(false);
		if (onBlur) onBlur();
	};

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	const getPaddingRight = () => {
		if (type === "password" && showToggle) return "46px";
		return "18px";
	};

	const transitions = {
		initial: { opacity: 0, scale: 0.95 },
		animate: { opacity: 1, scale: 1 },
		exit: { opacity: 0, scale: 0.95 },
		transition: { duration: 0.1 },
	};

	return (
		<InputStateContext.Provider value={{ isFocused, isError: error?.isError, hasValue: value.length > 0 }}>
			<InputContainer $column $gap={8}>
				{icon && (
					<IconContainer $isError={error?.isError} $isFocused={isFocused || value.length > 0}>
						{icon}
					</IconContainer>
				)}
				<StyledInput
					name={name}
					$isFocused={isFocused || value.length > 0}
					value={value}
					placeholder={placeholder}
					type={inputType}
					$isError={error?.isError}
					$paddingRight={getPaddingRight()}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
					onFocus={handleFocus}
					onBlur={handleBlur}
				/>
				{type === "password" && showToggle && (
					<ToggleButton
						type="button"
						onClick={togglePasswordVisibility}
						$isError={error?.isError}
						$isFocused={isFocused || value.length > 0}
					>
						<AP mode="wait" initial={false}>
							{showPassword ? (
								<m.div key={1} {...transitions}>
									<Icon.VisibilityOff />
								</m.div>
							) : (
								<m.div key={2} {...transitions}>
									<Icon.Visibility />
								</m.div>
							)}
						</AP>
					</ToggleButton>
				)}
			</InputContainer>
		</InputStateContext.Provider>
	);
};

const ToggleButton = styled.button<{ $isFocused: boolean; $isError?: boolean }>`
	position: absolute;
	right: 16px;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	padding: 4px;
	cursor: pointer;
	color: ${({ $isFocused, $isError }) => ($isError ? palette.danger : $isFocused ? palette.primary : palette.gray100)};
	transition: color 250ms;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;

	&:hover {
		color: ${({ $isError }) => ($isError ? palette.danger : palette.primary)};
	}

	svg {
		width: 18px;
		height: 18px;
	}
`;

const Input: FC<InputProps> & {
	Text: FC<InputTextProps>;
	Password: FC<InputPasswordProps>;
} = ({ width, error, children }) => {
	const transitions = {
		initial: { opacity: 0, y: -50, scale: 0.9 },
		animate: { opacity: 1, y: 0, scale: 1 },
		exit: { opacity: 0, y: -50, scale: 0.9 },
	};

	return (
		<InputContext.Provider value={{ error }}>
			<InputWrapper $width={width} $column $gap={8}>
				{children}
				<AP>
					{error?.isError && (
						<m.div {...transitions}>
							<ErrorMessage $padding={[12, 16]} $borderRadius={8} $bgc={"danger"}>
								{error?.message}
							</ErrorMessage>
						</m.div>
					)}
				</AP>
			</InputWrapper>
		</InputContext.Provider>
	);
};

const InputText: FC<InputTextProps> = (props) => {
	return <BaseInput type={"text"} {...props} />;
};

const InputPassword: FC<InputPasswordProps> = (props) => {
	return <BaseInput type="password" {...props} />;
};

Input.Text = InputText;
Input.Password = InputPassword;

export default Input;
