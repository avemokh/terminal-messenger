import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ModalState {
	auth: boolean;
}

const initialState: ModalState = {
	auth: false,
};

const modalSlice = createSlice({
	name: "modal",
	initialState,
	reducers: {
		setModalVisibility(state, action: PayloadAction<{ name: keyof ModalState; isVisible: boolean }>) {
			state[action.payload.name] = action.payload.isVisible;
		},
		closeAllModals(state) {
			for (const modal of Object.keys(state)) {
				state[modal as keyof ModalState] = false;
			}
		},
	},
});

export default modalSlice;
