import { expect } from "chai";
import { fake } from "sinon";

import { searchLocations } from "./locations.js";

/** @param {string} str */
const normalizeWhitespace = (str) => str.trim( ).replace(/\s+/g, " ");

describe("server/database/locations.js", function fileSuite( ) {

	describe("searchLocations()", function functionSuite( ) {

		it("should run the expected query", async function test( ) {
			const result = [ { query: "result" } ];
			const execute = fake.resolves(result);

			const returned = await searchLocations("search term", { execute });

			expect(returned).to.equal(result);
			expect(execute).to.have.callCount(1);

			const [ query ] = execute.getCall(0).args;
			expect(normalizeWhitespace(query.sql))
				.to.equal(normalizeWhitespace(`
				SELECT * FROM locations
				WHERE asciiname LIKE ?
				ORDER BY length(name) ASC,
                 name ASC
				LIMIT ? OFFSET ?`));
			expect(query.values).to.deep.equal([
				"search term%",
				100,
				0,
			]);
		});

		it("should select specific fields if provided", async function test( ) {
			const execute = fake.resolves([ ]);

			await searchLocations("search term", {
				fields: [ "field one", "field two" ],
				execute: execute,
			});

			expect(execute).to.have.callCount(1);

			const [ query ] = execute.getCall(0).args;
			expect(normalizeWhitespace(query.sql))
				.to.equal(normalizeWhitespace(`
				SELECT "field one", "field two"
				FROM locations
				WHERE asciiname LIKE ?
				ORDER BY length(name) ASC,
				         name ASC
				LIMIT ? OFFSET ?`));
		});

		it("should support custom limit/offset", async function test( ) {
			const execute = fake.resolves([ ]);

			await searchLocations("search term", {
				limit: 42,
				offset: 10,
				execute: execute,
			});

			expect(execute).to.have.callCount(1);

			const [ query ] = execute.getCall(0).args;
			const [ /* searchTerm */, limit, offset ] = query.values;
			expect(limit).to.equal(42);
			expect(offset).to.equal(10);
		});

		it("should escape wildcards in search terms", async function test( ) {
			const execute = fake.resolves([ ]);

			await searchLocations("search % term with wild%cards", { execute });

			expect(execute).to.have.callCount(1);

			const [ query ] = execute.getCall(0).args;
			const [ searchTerm ] = query.values;
			expect(searchTerm).to.equal("search \\% term with wild\\%cards%");
		});

	});

});
