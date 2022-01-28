// This is our database abstraction, which will adds nice APIs around queries
// to include additional logging and use promises rather than the default
// node-sqlite3 APIs.

import sqlite3 from "sqlite3";

import { DB_PATH } from "./config.js";
import { getChildLoggerFactory } from "./logger.js";

const getQueryLogger = getChildLoggerFactory("query");

/** @type {sqlite3.Database|null} */
let database = null; // lazily created once a query is run

/**
 * Runs the given SQL query against the database, returning a promise
 * which resolves to the resulting rows.
 * @param {import("sql-template-strings").SQLStatement} query
 * @param {object} [options]
 * @param {sqlite3.Database} [options.database]
 * The database to run queries against, useful for stubbing in a testing
 * context.
 * @returns {Promise<unknown[]>}
 */
export async function query(query, {
	// only create the default database the first time it is needed, then re-use it
	database: db = (database = database ?? new sqlite3.Database(DB_PATH)),
} = { }) {
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
		db.all(sql, values, function handleQueryResult(err, rows) {
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
