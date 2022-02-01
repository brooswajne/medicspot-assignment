import { expect } from "chai";
import { fake } from "sinon";

import { debounce } from "./async.js";

/** @param {number} ms */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("app/utils/async.js", function fileSuite( ) {

	describe("debounce()", function functionSuite( ) {

		it("should return a debounced wrapper of the given function", async function test( ) {
			const target = fake( );
			const debounced = debounce(target, { delay: 5 });

			debounced("call one");
			debounced("call two");
			debounced("call three");
			debounced("call four");

			expect(target).to.have.callCount(0);

			await wait(5);
			expect(target).to.have.been.calledOnceWithExactly("call four");
		});

	});

});
