module.exports = {

	root: true,
	parserOptions: { ecmaVersion: 2022 },
	extends: [ "@brooswajne" ],

	overrides: [ {
		files: [ "app/**/*" ],
		env: { browser: true, node: false },
		parserOptions: { ecmaFeatures: { jsx: true } },
		extends: [ "@brooswajne", "plugin:react/recommended" ],
		rules: {
			// allow PascalCase for components, or otherwise just kebab-case as normal
			"filename-rules/match": [ "error", /^\w+\.jsx$|^[.a-z-]+$/ ],
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",
		},
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
	}, {
		files: [ "**/*.test.js" ],
		extends: [ "@brooswajne/eslint-config/overrides/mocha" ],
	} ],

};
