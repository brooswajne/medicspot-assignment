import { DIR_ROUTES, PORT } from "./server/config.js";
import { createApplication } from "./server/application.js";

const app = await createApplication({
	port: PORT,
	routes: DIR_ROUTES,
});
await app.start( );
