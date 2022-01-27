export const DEFAULT_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generates a random integer in the specified range (upper-bound exclusive).
 * @param {number} min
 * @param {number} max
 */
export function generateRandomInt(min, max) {
	const random = Math.random( );
	const range = max - min;
	return Math.floor(random * range) + min;
}

/**
 * Generates a random string of the specified length, using the given alphabet.
 * @param {number} length
 * @param {string} alphabet
 */
export function generateRandomString(length, alphabet = DEFAULT_ALPHABET) {
	let string = "";
	while (string.length < length) {
		const charIndex = generateRandomInt(0, alphabet.length);
		const character = alphabet[ charIndex ];
		string += character;
	}
	return string;
}
