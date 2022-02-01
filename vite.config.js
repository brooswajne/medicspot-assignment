import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { PORT } from "./server/config.js";

const APP_PORT = Number(process.env.MEDICSPOT_APP_PORT)
	|| PORT + 1;

// eslint-disable-next-line import/no-default-export -- required by vite
export default defineConfig({
	server: {
		port: APP_PORT,
		// TODO: in a real app we'd probably just want to prefix API
		//       routes with a /api prefix
		proxy: { "/locations": `http://localhost:${PORT}` },
	},
	plugins: [ react( ) ],
});
