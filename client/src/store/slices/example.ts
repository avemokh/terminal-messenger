import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ExampleState {
	example: boolean;
}

const initialState: ExampleState = {
	example: false,
};

const exampleSlice = createSlice({
	name: "example",
	initialState,
	reducers: {
		setExample(state, action: PayloadAction<boolean>) {
			state.example = action.payload;
		},
	},
});

export default exampleSlice;
