import { BadRequestError } from "../errors.js";
import { searchLocations } from "../database/locations.js";

/**
 * @type {import("../routing").RequestHandler}
 * Searches for all locations matching the given name.
 * @returns {Promise<string[]>}
 */
export async function GET(request, { logger }) {
	const {
		q: search,
		limit,
		offset,
	} = request.query;

	// TODO: just support getting _all_ locations probably
	if (typeof search !== "string") throw new BadRequestError("Invalid search query");

	logger.debug(`Searching for locations matching query "${search}"`);
	const locations = await searchLocations(search, {
		fields: [ "name" ],
		limit: limit && Number.isInteger(limit) ? Number(limit) : undefined,
		offset: offset && Number.isInteger(offset) ? Number(offset) : undefined,
	});
	return locations.map((l) => l.name);
}
