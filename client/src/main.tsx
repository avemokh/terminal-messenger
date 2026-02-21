import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { setupStore } from "./store/store";
import ResetStyle from "./style/Reset";
import GlobalStyle from "./style/Global";

const store = setupStore();

createRoot(document.querySelector(".wrapper")!).render(
	<Provider store={store}>
		<BrowserRouter>
			<ResetStyle />
			<GlobalStyle />
			<App />
		</BrowserRouter>
	</Provider>,
);
