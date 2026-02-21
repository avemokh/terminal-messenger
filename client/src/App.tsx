import { type FC } from "react";
import AppRouter from "./AppRouter";
import Modals from "./components/Modal/Modals";

const App: FC = () => (
	<>
		<AppRouter />
		<Modals />
	</>
);

export default App;
