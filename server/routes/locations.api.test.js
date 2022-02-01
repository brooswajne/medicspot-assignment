import { expect } from "chai";

import {
	clearLocations,
	seedLocations,
} from "../../test/api/database.js";
import { api } from "../../test/api/application.js";
import { generateLocation } from "../../test/generators.js";

/**
 * @template {object} TSource
 * @param {TSource} object
 * @param {(keyof TSource)[]} keys
 * @returns {Partial<TSource>}
 */
const pick = (object, ...keys) => {
	/** @type {Partial<TSource>} */
	const picked = { };
	for (const key of keys) if (key in object) picked[ key ] = object[ key ];
	return picked;
};

describe("GET /locations", function endpointSuite( ) {

	it("should 400 if no search term is provided", async function test( ) {
		await api.get("/locations")
			.expect(400);
	});

	it("should respond with the wanted fields for all matching locations", async function test( ) {
		await clearLocations( );

		const matchingOne = generateLocation({ name: "needle one" });
		const matchingTwo = generateLocation({ name: "needle two" });
		await seedLocations([
			generateLocation({ name: "hay" }),
			generateLocation({ name: "hey" }),
			matchingOne,
			generateLocation({ name: "heyoo" }),
			matchingTwo,
			generateLocation({ name: "hay with needle but not at the start" }),
		]);

		const { body } = await api.get("/locations")
			.query({ q: "needle" })
			.expect(200);

		expect(body).to.have.deep.members([
			pick(matchingOne, "geonameid", "name"),
			pick(matchingTwo, "geonameid", "name"),
		]);
	});

	it("should respect limit/offset parameters", async function test( ) {
		await clearLocations( );
		const locations = new Array(100).fill(null)
			.map((_, idx) => generateLocation({ name: `match #${idx}` }));
		await seedLocations(locations);

		const { body: responseOne } = await api.get("/locations")
			.query({ q: "match", limit: 5, offset: 0 })
			.expect(200);
		expect(responseOne).to.have.lengthOf(5);

		const { body: responseTwo } = await api.get("/locations")
			.query({ q: "match", limit: 10, offset: 4 })
			.expect(200);
		expect(responseTwo).to.have.lengthOf(10);
		// if offset has been respected, we overlap on the last entry
		expect(responseTwo[ 0 ]).to.deep.equal(responseOne[ 4 ]);
	});

	it("should sort matches in a relevant order", async function test( ) {
		await clearLocations( );
		await seedLocations([
			generateLocation({ name: "good match (but less)" }),
			generateLocation({ name: "good match (but lesser)" }),
			generateLocation({ name: "good match" }),
			generateLocation({ name: "good match (but really not great)" }),
			generateLocation({ name: "good match (but much less)" }),
		]);

		const { body } = await api.get("/locations")
			.query({ q: "good" })
			.expect(200);

		// currently, we just classify something as a "good match" if it doesn't
		// have many "extra" characters after the search string
		expect(body.map((/** @type {{ name: string }} */ l) => l.name)).to.deep.equal([
			"good match",
			"good match (but less)",
			"good match (but lesser)",
			"good match (but much less)",
			"good match (but really not great)",
		]);
	});

});
