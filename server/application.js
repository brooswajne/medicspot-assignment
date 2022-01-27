import { createServer } from "http";

import express from "express";

import { logger } from "./logger.js";

/**
 * Creates the web application.
 * @param {object} settings
 * @param {number} settings.port
 * The port to serve the application on.
 */
export function createApplication({ port }) {
	logger.info("Creating application...");

	const app = express( );

	app.get("/", (_, res) => res.send("Hello world!"));

	// TODO: support https
	const server = createServer(app);

	const start = ( ) => new Promise(function startServer(resolve) {
		logger.debug("Starting server...");
		// per node documentation, this will throw synchronously if it errors
		// (eg. EADDRINUSE), which will be caught and auto-rejected by the
		// promise constructor
		server.listen(port, function onceListening( ) {
			logger.info(`Server started successfully. Listening on port ${port}.`);
			resolve(null);
		});
	});
	const stop = ( ) => new Promise(function stopServer(resolve, reject) {
		logger.debug("Stopping server...");
		server.close(function onceClosed(err) {
			if (err) reject(err);
			else resolve(null);
		});
	});

	return { app, server, start, stop };
}
