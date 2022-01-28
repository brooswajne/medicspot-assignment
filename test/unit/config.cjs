module.exports = {
	spec: "**/*.test.js",
	ignore: [
		"**/*.api.test.js",
		"node_modules/**/*",
	],
	require: "test/unit/setup.js",
};
