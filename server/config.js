// This file exports all configuration options for the application.
// These are currently just read from environment variables, but it would
// be sensible to use an actual config file in a proper production app.

import { LoggerLevel } from "@brooswajne/terrier";

const DEFAULT_PORT = 3000;
const DEFAULT_LOGGER_LEVEL = LoggerLevel.Info;

/** @type {number} The port which the server should listen on. */
export const PORT = Number(process.env.MEDICSPOT_PORT)
	|| DEFAULT_PORT;

/** @type {LoggerLevel} The level of logging to be included. */
export const LOGGER_LEVEL = Number(process.env.MEDICSPOT_LOGGER_LEVEL)
	|| DEFAULT_LOGGER_LEVEL;
