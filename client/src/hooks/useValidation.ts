import { useMemo } from "react";

export interface IValidation {
	minLength?: number;
	isEmail?: boolean;
	isPassword?: boolean;
}

export interface PasswordRequirements {
	isContainUpperCase: boolean;
	isContainLowerCase: boolean;
	isContainSpecial: boolean;
	isContainDigit: boolean;
	isLengthCorrect: boolean;
}

export interface UseValidationResponse {
	isInputValid: boolean;
	isLengthCorrect: boolean | null;
	isEmailCorrect: boolean | null;
	isPasswordCorrect: boolean | null;
	passwordRequirements: PasswordRequirements | null;
}

const EMAIL_REGEX =
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const useValidation = (value: string, validations: IValidation): UseValidationResponse => {
	if (validations.isPassword && !validations.minLength)
		throw new Error('"minLength" prop was required when "isPassword" prop = true');

	const validationResult = useMemo(() => {
		const isLengthCorrect = validations.minLength ? value.length >= validations.minLength : false;
		const isEmailCorrect = validations.isEmail ? EMAIL_REGEX.test(value) : true;
		const passwordChecks = validations.isPassword
			? {
					isContainUpperCase: /[A-ZА-Я]/g.test(value),
					isContainLowerCase: /[a-zа-я]/g.test(value),
					isContainSpecial: /[!@#$%^&.,*()\-_+=~]/g.test(value),
					isContainDigit: /\d/g.test(value),
					isLengthCorrect,
				}
			: null;
		const isPasswordCorrect = passwordChecks ? Object.values(passwordChecks).every(Boolean) : true;
		const isInputValid = isLengthCorrect && isEmailCorrect && isPasswordCorrect;

		return {
			isInputValid,
			isLengthCorrect,
			isEmailCorrect,
			isPasswordCorrect,
			passwordChecks,
		};
	}, [value, validations.minLength, validations.isEmail, validations.isPassword]);

	return {
		isInputValid: validationResult.isInputValid,
		isLengthCorrect: validations.minLength ? validationResult.isLengthCorrect : null,
		isEmailCorrect: validations.isEmail ? validationResult.isEmailCorrect : null,
		isPasswordCorrect: validations.isPassword ? validationResult.isPasswordCorrect : null,
		passwordRequirements: validations.isPassword ? validationResult.passwordChecks : null,
	};
};
