import { expect } from "chai";
import { fake } from "sinon";

import {
	createFileBasedRouter,
	toExpressHandler,
} from "./routing.js";
import { HttpError } from "./errors.js";

const tick = ( ) => new Promise((resolve) => process.nextTick(resolve));

describe("server/routing.js", function fileSuite( ) {

	describe("createFileBasedRouter()", function functionSuite( ) {

		it("should traverse all files in the given directory", async function test( ) {
			const readdir = fake(async function readdir(dir) {
				// mock a filesystem which looks like this:
				// - root
				// -- directory1
				// -- directory2
				// ---- directory2.1
				// ----- file2.1.1
				// --- file2.1
				// --- file2.2
				// -- directory3
				switch (dir) {
				case "root": return [
					{ name: "directory1", isDirectory: ( ) => true },
					{ name: "directory2", isDirectory: ( ) => true },
					{ name: "directory3", isDirectory: ( ) => true },
				];
				case "root/directory1": return [];
				case "root/directory2": return [
					{ name: "directory2.1", isDirectory: ( ) => true },
					{ name: "file2.1", isDirectory: ( ) => false },
					{ name: "file2.2", isDirectory: ( ) => false },
				];
				case "root/directory2/directory2.1": return [
					{ name: "file2.1.1", isDirectory: ( ) => false },
				];
				case "root/directory3": return [];
				default: throw new Error(`Unexpected directory read: ${dir}`);
				}
			});

			await createFileBasedRouter("root", {
				// @ts-expect-error -- this is just a stub implementation
				readdir,
			});

			expect(readdir).to.have.callCount(5);
			const directoriesRead = readdir.getCalls( )
				.map((call) => call.args[ 0 ]);
			expect(directoriesRead).to.have.members([
				"root",
				"root/directory1",
				"root/directory2",
				"root/directory2/directory2.1",
				"root/directory3",
			]);
		});

		it("should import a file it encounters iff it is a .js file", async function test( ) {
			const importer = fake.resolves({ });

			await createFileBasedRouter("root", {
				// @ts-expect-error -- this is just a stub implementation
				readdir: fake.resolves([
					// TODO: make a function to generate these without needing to tell
					//       typescript to calm down each time
					// @ts-expect-error -- this is just a stub implementation
					{ name: "no-extension", isDirectory: ( ) => false },
					// @ts-expect-error -- this is just a stub implementation
					{ name: "javascript.js", isDirectory: ( ) => false },
					// @ts-expect-error -- this is just a stub implementation
					{ name: "not-js.dll", isDirectory: ( ) => false },
					// test files should not be imported
					// @ts-expect-error -- this is just a stub implementation
					{ name: "a-test-file.test.js", isDirectory: ( ) => false },
				]),
				importer: importer,
			});

			expect(importer).to.have.been.calledOnceWithExactly("root/javascript.js");
		});

		it("should register routes for any exported http handlers", async function test( ) {
			const handlers = {
				DELETE: ( ) => ({ }),
				GET: ( ) => ({ }),
				PATCH: ( ) => ({ }),
				POST: ( ) => ({ }),
				PUT: ( ) => ({ }),
				notAnHttpMethod: ( ) => ({ }),
			};
			const importer = fake.resolves(handlers);
			const router = {
				delete: fake( ),
				get: fake( ),
				patch: fake( ),
				post: fake( ),
				put: fake( ),
			};
			const toHandler = fake((handler) => handler);

			await createFileBasedRouter("root", {
				// @ts-expect-error -- this is just a stub implementation
				readdir: fake.resolves([ { name: "file.js", isDirectory: ( ) => false } ]),
				importer: importer,
				// @ts-expect-error -- this is just a stub implementation
				router: router,
				toHandler: toHandler,
			});

			expect(importer).to.have.been.calledOnceWithExactly("root/file.js");
			expect(toHandler).to.have.callCount(5)
				.and.to.have.been.calledWith(handlers.DELETE)
				.and.to.have.been.calledWith(handlers.GET)
				.and.to.have.been.calledWith(handlers.PATCH)
				.and.to.have.been.calledWith(handlers.POST)
				.and.to.have.been.calledWith(handlers.PUT);
			expect(router.delete).to.have.been.calledOnceWithExactly("/file", handlers.DELETE);
			expect(router.get).to.have.been.calledOnceWithExactly("/file", handlers.GET);
			expect(router.patch).to.have.been.calledOnceWithExactly("/file", handlers.PATCH);
			expect(router.post).to.have.been.calledOnceWithExactly("/file", handlers.POST);
			expect(router.put).to.have.been.calledOnceWithExactly("/file", handlers.PUT);
		});

		it("should turn square brackets into route parameters", async function test( ) {
			const router = { get: fake( ) };

			await createFileBasedRouter("root", {
				// @ts-expect-error -- this is just a stub implementation
				readdir: fake.resolves([
					// @ts-expect-error -- this is just a stub implementation
					{ name: "/file/with/[param].js", isDirectory: ( ) => false },
				]),
				importer: fake.resolves({ GET: ( ) => ({ }) }),
				// @ts-expect-error -- this is just a stub implementation
				router: router,
			});

			expect(router.get).to.have.been.calledOnceWith("/file/with/:param");
		});

	});

	describe("toExpressHandler()", function functionSuite( ) {

		it("should pass the request and some context to the handler", async function test( ) {
			const handler = fake( );
			const expressHandler = toExpressHandler(handler, { source: "test" });

			const callTime = Date.now( );
			const req = { };
			// @ts-expect-error -- arguments are just stubs
			expressHandler(req, {
				on: fake( ),
				send: fake( ),
			}, fake( ));
			await tick( );

			expect(handler).to.have.callCount(1);
			const [ request, context ] = handler.getCall(0).args;
			expect(request).to.equal(req);
			expect(context).to.have.keys("logger", "timestamp");
			expect(context).to.have.property("logger")
				.which.has.property("prefix")
				.which.matches(/request:\w+/);
			expect(context).to.have.property("timestamp")
				.which.is.greaterThanOrEqual(callTime);
		});

		it("should respond with the data returned by the handler", async function test( ) {
			const response = { json: "data" };
			const handlerSync = fake.returns(response);
			const handlerAsync = fake.resolves(response);

			const res = {
				on: fake( ),
				send: fake( ),
			};

			// @ts-expect-error -- arguments are just stubs
			toExpressHandler(handlerSync, { source: "test" })({ }, res, fake( ));
			await tick( );

			expect(handlerSync).to.have.callCount(1);
			await tick( );

			expect(res.send, "sync response should be sent")
				.to.have.been.calledOnceWithExactly(response);

			res.send.resetHistory( );
			expect(res.send).to.have.callCount(0);

			// @ts-expect-error -- arguments are just stubs
			toExpressHandler(handlerAsync, { source: "test" })({ }, res, fake( ));
			await tick( );

			expect(handlerAsync).to.have.callCount(1);
			expect(res.send, "async response should be sent")
				.to.have.been.calledOnceWithExactly(response);
		});

		it("should catch any errors thrown by the handler", async function test( ) {
			const error = new Error("oh no AAAAAA");
			const handlerSync = fake.throws(error);
			const handlerAsync = fake.rejects(error);

			const next = fake( );

			// @ts-expect-error -- arguments are just stubs
			toExpressHandler(handlerSync, { source: "test" })({ }, {
				on: fake( ),
				send: fake( ),
			}, next);
			// note: if we got here, then the express handler successfully didn't
			//       re-throw the sync error

			await tick( ); // handler gets called
			await tick( ); // error gets caught

			expect(next, "sync errors should be forwarded to next()")
				.to.have.been.calledOnceWithExactly(error);

			next.resetHistory( );
			expect(next).to.have.callCount(0);

			// @ts-expect-error -- arguments are just stubs
			toExpressHandler(handlerAsync, { source: "test" })({ }, {
				on: fake( ),
				send: fake( ),
			}, next);
			await tick( );

			expect(next, "async rejections should be forwarded to next()")
				.to.have.been.calledOnceWithExactly(error);
		});

		it("should handle thrown HttpError instances", async function test( ) {
			const error = new HttpError(314, "Too much pie", {
				code: "2_MUCH_PI",
				message: "Sorry user, we ate it all",
			});
			const handler = fake.rejects(error);

			/** @typedef {import("sinon").SinonSpy} SinonSpy */
			/** @type {{ on: SinonSpy, send: SinonSpy, status: SinonSpy }} */
			const res = {
				on: fake( ),
				send: fake( ),
				status: fake(( ) => res),
			};

			// @ts-expect-error -- arguments are just stubs
			toExpressHandler(handler, { source: "test" })({ }, res, fake( ));

			await tick( ); // handler gets called
			await tick( ); // error gets caught

			expect(res.status).to.have.been.calledOnceWithExactly(314);
			expect(res.send).to.have.been.calledOnceWithExactly(error.response);
		});

	});

});
