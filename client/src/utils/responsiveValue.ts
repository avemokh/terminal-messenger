export const rv = (startValue: number, endValue: number) => {
	return `calc(${endValue}px + (${startValue - endValue}) * ((100vw - 320px) / (1920 - 320)))`;
};
