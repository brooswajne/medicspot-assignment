module.exports = {

	root: true,
	parserOptions: { ecmaVersion: 2022 },
	extends: [ "@brooswajne" ],

	overrides: [ {
		files: [ "**/*.test.js" ],
		extends: [ "@brooswajne/eslint-config/overrides/mocha" ],
	} ],

};
