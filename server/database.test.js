import { expect } from "chai";
import { fake } from "sinon";
import sql from "sql-template-strings";

import { query } from "./database.js";

describe("server/database.js", function fileSuite( ) {

	describe("query()", function functionSuite( ) {

		it("should resolve with the rows resulting from db.all()", async function test( ) {
			const rows = [ { row: "one" }, { row: "two" } ];
			const database = { all: fake.yieldsAsync(null, rows) };
			const statement = sql`SELECT foo FROM bar WHERE id = ${123}`;

			const resolved = await query(statement, {
				// @ts-expect-error -- just a stub
				database,
			});

			expect(resolved).to.equal(rows);
			expect(database.all)
				.to.have.been.calledOnceWith(statement.sql, statement.values);
		});

		it("should reject with the error resulting from db.all()", async function test( ) {
			const error = new Error("failed to query");
			const database = { all: fake.yieldsAsync(error, null) };
			const statement = sql`SELECT foo FROM bar WHERE id = ${123}`;

			await expect(query(statement, {
				// @ts-expect-error -- just a stub
				database,
			})).to.be.rejectedWith(error);
			expect(database.all)
				.to.have.been.calledOnceWith(statement.sql, statement.values);
		});
	});

});
