/* eslint-disable no-magic-numbers -- just arbitrary for random data */

import {
	generateRandomInt,
	generateRandomString,
} from "../server/random.js";

/** @typedef {import("../server/database/locations").Location} Location */

/**
 * Generates a random location database entry, for testing purposes.
 * @param {Partial<Location>} overrides
 * @returns {Location}
 */
export function generateLocation(overrides = { }) {
	return {
		"geonameid": String(generateRandomInt(0, 10_000)),
		"name": overrides.name
			?? overrides.asciiname
			?? generateRandomString(10),
		"asciiname": overrides.asciiname
			?? overrides.name
			?? generateRandomString(10),
		"alternatenames": generateRandomString(10),
		"latitude": `${generateRandomInt(0, 10)}.${generateRandomInt(0, 10_000)}`,
		"longitude": `${generateRandomInt(0, 10)}.${generateRandomInt(0, 10_000)}`,
		"feature_class": generateRandomString(1, "SML"),
		"feature_code": generateRandomString(4, "ABCDEFGHIJK"),
		"country_code": generateRandomString(2, "ABCDEFGHIJK"),
		"cc2": generateRandomString(2, "ABCDEFGHIJK"),
		"admin1_code": generateRandomString(2, "0123456789"),
		"admin2_code": generateRandomString(2, "0123456789"),
		"admin3_code": generateRandomString(2, "0123456789"),
		"admin4_code": generateRandomString(2, "0123456789"),
		"population": String(generateRandomInt(0, 100_000)),
		"elevation": String(generateRandomInt(0, 5000)),
		"dem": String(generateRandomInt(0, 100)),
		"timezone": `${generateRandomString(10)}/${generateRandomString(20)}`,
		"modification_date": new Date(generateRandomInt(0, Date.now( ))).toISOString( ),
		...overrides,
	};
}
