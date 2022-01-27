import { PORT } from "./server/config.js";
import { createApplication } from "./server/application.js";

const app = createApplication({ port: PORT });
await app.start( );
