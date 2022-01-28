// This file contains the logic for the file-based routing mechanism used by
// this web application.

import {
	extname,
	join,
	relative,
} from "path";
import { METHODS } from "http";
import { readdir as fsReaddir } from "fs/promises";

import { Router as createRouter } from "express";

import {
	getChildLogger,
	getChildLoggerFactory,
} from "./logger.js";
import { HttpError } from "./errors.js";

const logger = getChildLogger("routing");
const getRequestLogger = getChildLoggerFactory("request");

/** @typedef {import("express").Request} Request */
/**
 * @typedef {object} RequestContext
 * @property {import("./logger").LoggerChildInstance} logger
 * The logger instance associated with this request.
 * @property {number} timestamp
 * The timestamp of the date at which this request was made.
 */
/** @typedef {(req: Request, context: RequestContext) => Promise<any>} RequestHandler */

/**
 * Recursively traverses all files in the given directory, calling the provided
 * `visit` callback for each file.
 * @param {string} directory
 * @param {(filepath: string) => Promise<void>} visit
 * @param {object} [options]
 * @param {import("fs/promises").readdir} [options.readdir]
 * A custom implementation of `fs.readdir`.
 * Useful for providing stubs in a testing context.
 */
async function traverse(directory, visit, {
	readdir = fsReaddir,
} = { }) {
	const entries = await readdir(directory, { withFileTypes: true });
	await Promise.all(entries.map(async function handleEntry(entry) {
		const file = entry.name;
		const path = join(directory, file);
		if (entry.isDirectory( )) await traverse(path, visit, { readdir });
		else await visit(path);
	}));
}

/**
 * Given a function which acts as a promise-based request handler, turns it
 * into an express.js request handler.
 * @param {RequestHandler} handler
 * @param {object} details
 * @param {string} details.source
 * The source location where this request handler has been defined, used for
 * tracing and debugging issues.
 * @returns {import("express").RequestHandler}
 */
export const toExpressHandler = (handler, { source }) => function expressHandler(req, res, next) {
	const logger = getRequestLogger( );
	const timestamp = Date.now( );

	logger.info(`${req.method} ${req.url}`);
	res.on("finish", function onceResponded( ) {
		const status = res.statusCode;
		// @ts-expect-error -- _contentLength is an undocumented property
		const size = res._contentLength ?? res.get("Content-Length") ?? null;
		const duration = Date.now( ) - timestamp;
		logger.info(`${req.method} ${req.url}: ${status} (${size} B) after ${duration}ms`);
	});

	// wrap the request handler call in Promise#then() to automatically catch
	// any possible synchronous errors
	Promise.resolve( ).then(function invokeRequestHandler( ) {
		logger.trace(`Using handler ${source}`);
		return handler(req, { logger, timestamp });
	}).then(function handleResponse(response) {
		const duration = Date.now( ) - timestamp;
		logger.trace(`Handler returned ${typeof response} after ${duration}ms`);
		// TODO: support a way for the response to specify status code (other
		//       than error responses)
		// TODO: support streaming responses etc rather than always needing an
		//       exact object to respond with
		res.send(response);
	}).catch(function handleError(err) {
		logger.error(err);
		const isHttpError = err instanceof HttpError;
		// handle the error now if it's an HttpError instance
		if (isHttpError) res.status(err.status).send(err.response);
		// otherwise fall back to the default express.js error handling
		else next(err);
	});
};

/**
 * Creates a new `express.Router` which uses simple folder-based routing for the
 * given directory.
 * The directory will be recursively traversed, and any JavaScript files found
 * within will be imported asynchronously. Any functions exported by those files
 * which match HTTP verbs (eg. GET/POST/...) will be used as route-handlers for
 * those routes.
 * To use route parameters, use square-brackets in the file's name, eg. a file
 * at path `/foo/[id].js` would register a route under `/foo/:id`.
 *
 * @param {string} directory
 *
 * @param {object} [options]
 * @param {(file: string) => Promise<any>} [options.importer]
 * An override for the mechanism to import a javascript file. Defaults to just
 * using an ES6 asynchronous import.
 * Useful for providing stubs in a testing context.
 * @param {import("express").Router} [options.router]
 * The express router which routes should be registered to. If none is provided,
 * a new router instance will be created.
 * Useful for providing stubs in a testing context.
 * Note that this router will be the one returned by the call to this function.
 * @param {import("fs/promises").readdir} [options.readdir]
 * A custom implementation of `fs.readdir`.
 * Useful for providing stubs in a testing context.
 * @param {typeof toExpressHandler} [options.toHandler]
 * A function turning a promise-based request handler into an express.js request
 * handler.
 * Useful for providing stubs in a testing context.
 *
 * @returns {Promise<import("express").Router>}
 */
export async function createFileBasedRouter(directory, {
	importer = (file) => import(file),
	readdir = fsReaddir,
	router = createRouter( ),
	toHandler = toExpressHandler,
} = { }) {
	logger.debug(`Creating a file-based router using root: ${directory}`);

	await traverse(directory, async function initialiseRoute(filepath) {
		const isJavascript = extname(filepath) === ".js";
		if (!isJavascript) return;

		const isTestFile = filepath.endsWith(".test.js");
		if (isTestFile) return;

		const route = relative(directory, filepath)
			// turn square brackets into route parameters
			.replace(/\[(\w+)]/g, (_, param) => `:${param}`)
			// strip the file extension
			.replace(/\.js$/, "");

		// register any handlers we find for this file
		const exported = await importer(filepath);
		for (const name in exported) {
			const isValidHttpMethod = METHODS.includes(name);
			if (!isValidHttpMethod) continue;

			const value = exported[ name ];
			const isValidHandler = typeof value === "function";
			if (!isValidHandler) continue;

			const source = `${filepath}:${name}()`;
			const expressHandler = toHandler(value, { source });
			const expressMethodName = name.toLowerCase( );
			// TODO: abstract isValidHttpMethod in a way that makes this type-safe
			// @ts-expect-error -- doesn't know that expressMethodName isn't just any string
			router[ expressMethodName ](`/${route}`, expressHandler);
			logger.trace(`Initialised route: ${name} /${route}`);
		}
	}, { readdir });

	return router;
}
