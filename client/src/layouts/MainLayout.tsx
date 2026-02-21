import type { FC } from "react";
import { motion as m } from "framer-motion";
import { Outlet } from "react-router-dom";

const MainLayout: FC = () => {
	const transitions = {
		initial: { opacity: 0, y: -10 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -10 },
	};

	return (
		<m.div {...transitions}>
			<Outlet />
		</m.div>
	);
};

export default MainLayout;
