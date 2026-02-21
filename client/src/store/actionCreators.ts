import exampleSlice from "./slices/example";
import modalSlice from "./slices/modal";

export default {
	...exampleSlice.actions,
	...modalSlice.actions,
};
