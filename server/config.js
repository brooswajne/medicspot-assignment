// This file exports all configuration options for the application.
// These are currently just read from environment variables, but it would
// be sensible to use an actual config file in a proper production app.

import { dirname, join } from "path";

import { LoggerLevel } from "@brooswajne/terrier";

const DEFAULT_PORT = 3000;

const DIR_HERE = dirname(import.meta.url.slice("file://".length));
const DIR_ROOT = join(DIR_HERE, "../");

// --- Server Configuration

/** @type {number} The port which the server should listen on. */
export const PORT = Number(process.env.MEDICSPOT_PORT)
	|| DEFAULT_PORT;

/** @type {string} The directory containing all API routes. */
export const DIR_ROUTES = process.env.MEDICSPOT_ROUTES
	|| join(DIR_HERE, "routes");

/** @type {LoggerLevel} The level of logging to be included. */
export const LOGGER_LEVEL = process.env.MEDICSPOT_LOGGER_LEVEL
	? Number(process.env.MEDICSPOT_LOGGER_LEVEL)
	: LoggerLevel.Info;

// --- Database Configuration

/** @type {string} The database to be used by the application. */
export const DB_PATH = process.env.MEDICSPOT_DB_PATH
	|| join(DIR_ROOT, "data/locations.db");

/** @type {string} The database table containing all geo-locations data. */
export const DB_TABLE_LOCATIONS = process.env.MEDICSPOT_DB_TABLE_LOCATIONS
	|| "locations";

// --- Client App Configuration

/** @type {string} The directory containing the build frontend app. */
export const DIR_APP = process.env.MEDICSPOT_APP
	|| join(DIR_ROOT, "dist");
