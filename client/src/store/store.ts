import { combineReducers, configureStore } from "@reduxjs/toolkit";
import exampleSlice from "./slices/example";
import { api } from "@/services/api";
import modalSlice from "./slices/modal";

const rootReducer = combineReducers({
	example: exampleSlice.reducer,
	modal: modalSlice.reducer,
	[api.reducerPath]: api.reducer,
});

export const setupStore = () =>
	configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
	});

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
