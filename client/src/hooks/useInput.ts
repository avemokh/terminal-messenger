import { useState } from "react";
import { useValidation, type IValidation, type UseValidationResponse } from "./useValidation";

interface UseInputReturns {
	value: string;
	isDirty: boolean;
	reset: () => void;
	onChange: (value: string) => void;
	onBlur: () => void;
}

export const useInput = (initialValue: string, validations: IValidation): UseInputReturns & UseValidationResponse => {
	const [value, setValue] = useState<string>(initialValue);
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const valid = useValidation(value, validations);

	const onChange = (newValue: string) => setValue(newValue);
	const onBlur = () => setIsDirty(true);
	const reset = () => {
		setValue("");
		setIsDirty(false);
	};

	return {
		value,
		isDirty,
		onChange,
		onBlur,
		reset,
		...valid,
	};
};
