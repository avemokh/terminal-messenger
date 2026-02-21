import { defineConfig } from "vite";

import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@icons": path.resolve(__dirname, "./src/assets/icons"),
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@UI": path.resolve(__dirname, "./src/components/UI"),
		},
	},
	plugins: [react(), svgr()],
});
