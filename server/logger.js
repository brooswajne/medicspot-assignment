// This file defines the logging mechanism for the application.
// Exposes some functions for easily generating "child loggers", which are
// logger instances with added context for more easily tracing the source
// of logs.

import {
	createColor,
	createLogger,
} from "@brooswajne/terrier";

import { LOGGER_LEVEL } from "./config.js";
import { generateRandomString } from "./random.js";

/** @typedef {import("@brooswajne/terrier").Logger} Logger */
/** @typedef {Logger & { prefix: string }} LoggerChild */
/** @typedef {LoggerChild & { id: string }} LoggerChildInstance */

const LOGGING_ID_LENGTH = 6;

/** The possible colours which will be used to identify logger components. */
export const COMPONENT_COLOURS = Object.freeze([
	createColor("38;5;28"),
	createColor("38;5;31"),
	createColor("38;5;172"),
	createColor("38;5;174"),
	createColor("38;5;208"),
	createColor("38;5;210"),
]);

/** The root application logger instance. */
export const logger = createLogger({ level: LOGGER_LEVEL });

let numComponents = 0;

/**
 * Creates a child logger of the given logger instance, automatically
 * associating a colour with that child so it can better be identified
 * in logs.
 * @param {string} name
 * @param {Logger} [parent]
 * @returns {LoggerChild}
 */
export function getChildLogger(name, parent = logger) {
	const number = numComponents++;
	const colour = COMPONENT_COLOURS[ number % COMPONENT_COLOURS.length ];
	const prefix = colour(name);
	return Object.assign(parent.child(prefix), { prefix });
}

/**
 * Gets a factory function which can be used to create child logger
 * instances of the given logger instance, giving a unique random ID
 * to each child that it generates.
 * @param {string} name
 * @param {Logger} [parent]
 * @returns {() => LoggerChildInstance}
 */
export function getChildLoggerFactory(name, parent = logger) {
	const number = numComponents++;
	const colour = COMPONENT_COLOURS[ number % COMPONENT_COLOURS.length ];
	return function getChild( ) {
		const id = generateRandomString(LOGGING_ID_LENGTH);
		const prefix = colour(`${name}:${id}`);
		return Object.assign(parent.child(prefix), { prefix, id });
	};
}
