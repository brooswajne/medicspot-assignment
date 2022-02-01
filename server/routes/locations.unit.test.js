import { expect } from "chai";
import { fake } from "sinon";

import { BadRequestError } from "../errors.js";

import { GET } from "./locations.js";

describe("routes/locations.js", function fileSuite( ) {

	describe("GET()", function handlerSuite( ) {

		it("should throw a BadRequestError if no search term is provided", async function test( ) {
			const logger = { debug: fake( ) };
			// @ts-expect-error -- not a real request object
			await expect(GET({
				query: { },
			}, { logger }))
				.to.be.rejectedWith(BadRequestError);
		});

		it("should return the matching locations", async function test( ) {
			const logger = { debug: fake( ) };
			const locations = [
				{ geonameid: 3141, name: "location one" },
				{ geonameid: 2718, name: "location two" },
			];
			const searchLocationsImpl = fake.resolves(locations);

			// @ts-expect-error -- not a real request object
			const returned = await GET({
				query: { q: "search term" },
			}, { logger }, { searchLocationsImpl });

			expect(searchLocationsImpl).to.have.been.calledOnceWithExactly("search term", {
				fields: [ "geonameid", "name", "latitude", "longitude" ],
				limit: undefined,
				offset: undefined,
			});
			expect(returned).to.deep.equal(locations);
		});

		it("should pass limit/offset query params to the locations search", async function test( ) {
			const logger = { debug: fake( ) };
			const searchLocationsImpl = fake.resolves([ ]);

			// @ts-expect-error -- not a real request object
			await GET({ query: {
				q: "search term",
				limit: "322",
				offset: "15",
			} }, { logger }, { searchLocationsImpl });

			expect(searchLocationsImpl).to.have.been.calledOnceWithExactly("search term", {
				fields: [ "geonameid", "name", "latitude", "longitude" ],
				limit: 322,
				offset: 15,
			});
		});

		it("should ignore non-integer limit/offset", async function test( ) {
			const logger = { debug: fake( ) };
			const searchLocationsImpl = fake.resolves([ ]);

			// @ts-expect-error -- not a real request object
			await GET({ query: {
				q: "search term",
				limit: "3.1415",
				offset: "2.7182",
			} }, { logger }, { searchLocationsImpl });

			expect(searchLocationsImpl).to.have.been.calledOnceWithExactly("search term", {
				fields: [ "geonameid", "name", "latitude", "longitude" ],
				limit: undefined,
				offset: undefined,
			});
		});

	});

});
