// This file contains utility functions for dealing with asynchronous logic.

const DEFAULT_DEBOUNCE_DELAY = 100;

/**
 * Returns a basic debounced version of the given function, which will only
 * be called after the given debounce delay.
 * Note that any returned value by the original function will be lost.
 * @template TThis
 * @template {unknown[]} TArgs
 * @param {(this: TThis, ...args: TArgs) => unknown} func
 * @param {object} [options]
 * @param {number} [options.delay]
 * @returns {(this: TThis, ...args: TArgs) => void}
 */
export function debounce(func, {
	delay = DEFAULT_DEBOUNCE_DELAY,
} = { }) {
	/** @type {NodeJS.Timeout | null} */
	let timer = null;
	return function debounced(...args) {
		if (timer != null) clearTimeout(timer);
		timer = setTimeout(( ) => func.apply(this, args), delay);
	};
}
