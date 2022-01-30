// This file exports some utility methods for interacting with the database
// during API tests, allowing us to easily seed it with exactly the data
// relevant for the specific test.

import sql from "sql-template-strings";

import { DB_TABLE_LOCATIONS } from "../../server/config.js";
import { query } from "../../server/database.js";

export async function clearLocations( ) {
	await query(sql([ `DELETE FROM ${DB_TABLE_LOCATIONS}` ]));
}

/** @param {Array<import("../../server/database/locations").Location>} locations */
export async function seedLocations(locations) {
	const insert = sql``.append(`
	INSERT INTO ${DB_TABLE_LOCATIONS} (
		"geonameid",
		"name",
		"asciiname",
		"alternatenames",
		"latitude",
		"longitude",
		"feature_class",
		"feature_code",
		"country_code",
		"cc2",
		"admin1_code",
		"admin2_code",
		"admin3_code",
		"admin4_code",
		"population",
		"elevation",
		"dem",
		"timezone",
		"modification_date"
	) VALUES `);

	let needsComma = false;
	for (const location of locations) {
		if (needsComma) insert.append(", ");
		insert.append(sql`(
			${location.geonameid},
			${location.name},
			${location.asciiname},
			${location.alternatenames},
			${location.latitude},
			${location.longitude},
			${location.feature_class},
			${location.feature_code},
			${location.country_code},
			${location.cc2},
			${location.admin1_code},
			${location.admin2_code},
			${location.admin3_code},
			${location.admin4_code},
			${location.population},
			${location.elevation},
			${location.dem},
			${location.timezone},
			${location.modification_date}
		)`);
		needsComma = true;
	}

	return query(insert);
}
