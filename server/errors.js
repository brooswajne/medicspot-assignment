// This file exports error classes to make error handling in our file-based
// routing framework very ergonomic.
// Your promise-based request handler just needs to throw an error extending
// the HttpError class, and the original request will be responded to with
// the associated error status / message.

import { logger } from "./logger.js";

const STATUS_CODE_BAD_REQUEST = 400;
const STATUS_CODE_NOT_FOUND = 404;
const STATUS_CODE_INTERNAL = 500;

/**
 * @typedef {object} HttpErrorOptions
 * @property {string} [code]
 * An error code which can be displayed to the user, and can be used when
 * tracing back the source of the error.
 * @property {string} [message]
 * An error message which can be displayed to the user.
 */

export class HttpError extends Error {
	/**
	 * @param {number} status
	 * The HTTP status code of the response for this error.
	 * @param {string} message
	 * The internal error message which will be displayed in the error's stack
	 * trace.
	 * @param {HttpErrorOptions} [options]
	 */
	constructor(status, message, {
		code,
		message: userMessage = "Unexpected Error",
	} = { }) {
		super(message);
		/** The HTTP status code of the response for this error. */
		this.status = status;
		/** The internal error code for this error. */
		this.code = code;
		/** The error message which will be shown to the user. */
		this.response = code ? `${code}: ${userMessage}` : userMessage;
		this.name = "HttpError";
	}
}

export class BadRequestError extends HttpError {
	/**
	 * @param {string} [message]
	 * @param {HttpErrorOptions} [options]
	 */
	constructor(message = "Bad Request", options = { }) {
		super(STATUS_CODE_BAD_REQUEST, message, {
			message: "Bad Request",
			...options,
		});
		this.name = "BadRequestError";
	}
}

export class NotFoundError extends HttpError {
	/**
	 * @param {string} [message]
	 * @param {HttpErrorOptions} [options]
	 */
	constructor(message = "Not Found", options = { }) {
		super(STATUS_CODE_NOT_FOUND, message, {
			message: "Not Found",
			...options,
		});
		this.name = "NotFoundError";
	}
}

export class InternalError extends HttpError {
	/**
	 * @param {string} [message]
	 * @param {HttpErrorOptions} [options]
	 */
	constructor(message = "Internal Server Error", options = { }) {
		super(STATUS_CODE_INTERNAL, message, {
			message: "Internal Server Error",
			...options,
		});
		this.name = "InternalError";
	}
}

/**
 * @type {import("express").ErrorRequestHandler}
 * The default express.js error handler to be applied as a last fallback for
 * all requests.
 */
// eslint-disable-next-line max-params -- required by express.js
export function defaultErrorHandler(err, _req, res, _next) {
	logger.error(err);
	res.status(STATUS_CODE_INTERNAL).send("Internal Server Error");
}
