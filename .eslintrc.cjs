module.exports = {

	root: true,
	parserOptions: { ecmaVersion: 2022 },
	extends: [ "@brooswajne" ],

	overrides: [ {
		files: [ "**/*.test.js" ],
		extends: [ "@brooswajne/eslint-config/overrides/mocha" ],
	}, {
		files: [ "server/routes/**/*" ],
		rules: {
			// allow http method handlers to have capital letters
			"new-cap": [ "error", { "capIsNewExceptions": [
				"DELETE",
				"GET",
				"PATCH",
				"POST",
				"PUT",
			] } ],
		},
	} ],

};
