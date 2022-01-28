// This is our database abstraction, which will adds nice APIs around queries
// to include additional logging and use promises rather than the default
// node-sqlite3 APIs.

import sqlite3 from "sqlite3";

import { DB_PATH } from "./config.js";
import { getChildLoggerFactory } from "./logger.js";

// TODO: this connects to the database immediately, should probably refactor
//       to only connect when a query is actually being made to avoid needing
//       to connect to the database during unit tests
export const database = new sqlite3.Database(DB_PATH);

const getQueryLogger = getChildLoggerFactory("query");

/**
 * Runs the given SQL query against the database, returning a promise
 * which resolves to the resulting rows.
 * @param {import("sql-template-strings").SQLStatement} query
 * @returns {Promise<unknown[]>}
 */
export async function query(query) {
	const logger = getQueryLogger( );

	const { sql, values } = query;
	logger.debug(sql);
	logger.trace(values);

	const start = Date.now( );
	return new Promise(function runQuery(resolve, reject) {
		// TODO: currently just using database.all(...) as we always want
		//       all results as JSON anyways in our use cases, but we should
		//       have an option to async iterate over the results by preparing
		//       the statement and using statement.get()
		//       https://github.com/mapbox/node-sqlite3/wiki/API#statementgetparam--callback
		//       however, figuring out how to finalise the statement might be
		//       weird...
		database.all(sql, values, function handleQueryResult(err, rows) {
			logger.debug(`Done in ${Date.now( ) - start}ms`);
			if (err) {
				logger.error(err);
				reject(err);
			} else {
				logger.trace(`${rows.length} row(s) returned`);
				resolve(rows);
			}
		});
	});
}
