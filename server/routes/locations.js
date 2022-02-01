import { BadRequestError } from "../errors.js";
import { searchLocations } from "../database/locations.js";

/**
 * @type {import("../routing").RequestHandler}
 * Searches for all locations matching the given name.
 * @returns {Promise<string[]>}
 */
export async function GET(request, { logger }, {
	// for dependency injection
	searchLocationsImpl = searchLocations,
} = { }) {
	const { q: search } = request.query;
	const limit = Number(request.query.limit);
	const offset = Number(request.query.offset);

	// TODO: just support getting _all_ locations probably
	if (typeof search !== "string") throw new BadRequestError("Invalid search query");

	logger.debug(`Searching for locations matching query "${search}"`);
	const locations = await searchLocationsImpl(search, {
		fields: [ "geonameid", "name" ],
		limit: Number.isInteger(limit) ? limit : undefined,
		offset: Number.isInteger(offset) ? offset : undefined,
	});
	return locations;
}
