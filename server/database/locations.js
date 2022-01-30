import sql from "sql-template-strings";

import { DB_TABLE_LOCATIONS } from "../config.js";
import { query } from "../database.js";

const DEFAULT_LIMIT = 100;

/**
 * Searches for locations with names matching the given ascii search string.
 *
 * @param {string} search
 * @param {object} [options]
 * @param {string[]} [options.fields]
 * By default, all fields of the matching location rows will be returned. If
 * this argument is provided, only the location fields specified will be
 * included.
 * TODO: typescript magic to make return type match this
 * @param {number} [options.limit]
 * The maximum number of locations to include in the results.
 * @param {number} [options.offset]
 * The offset from which to start finding locations.
 * @param {(sql: import("sql-template-strings").SQLStatement) => Promise<any[]>} [options.execute]
 * The function used to execute the SQL query. Useful for stubbing in a test
 * context.
 *
 * @returns {Promise<any[]>}
 */
export async function searchLocations(search, {
	fields = [],
	limit = DEFAULT_LIMIT,
	offset = 0,
	// for dependency injection
	execute = query,
} = { }) {

	const likeQuery = `%${search.replace(/%/g, "\\%")}%`;
	const statement = sql``
		// TODO: this is vulnerable to SQL injection if `fields` was to come
		//       from user input (which it isn't in our case luckily)
		.append(`SELECT ${fields.join(", ") || "*"}`)
		.append(` FROM ${DB_TABLE_LOCATIONS} WHERE`)
		.append(sql` asciiname LIKE ${likeQuery}`)
		// TODO: this is a pretty terrible way of ordering the search results,
		//       but at least it's deterministic for the offset to be consistent
		//       better would be to use proper text searching
		.append(sql` ORDER BY length(name) ASC, name ASC`)
		.append(sql` LIMIT ${limit}`)
		.append(sql` OFFSET ${offset}`);

	return execute(statement);

}
