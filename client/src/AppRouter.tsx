import type { FC } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence as AP } from "framer-motion";
import Page from "./pages/Page";

const AppRouter: FC = () => {
	const location = useLocation();

	return (
		<AP mode="wait" initial={false}>
			<Routes key={location.pathname} location={location}>
				<Route index element={<Page />} />
			</Routes>
		</AP>
	);
};

export default AppRouter;
