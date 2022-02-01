// This file contains custom react hooks for the application.

import { useRef, useState } from "react";

import { debounce } from "./async.js";

/**
 * A wrapper around useState() which will debounce calls to setState().
 * @template TState
 * @param {TState} initialState
 * @param {object} [options]
 * @param {number} [options.delay]
 * The debounce delay to be applied.
 */
export function useDebouncedState(initialState, {
	delay,
} = { }) {
	const [ state, setState ] = useState(initialState);
	const debouncedSetState = useRef(debounce(setState, { delay }));
	return [ state, debouncedSetState.current ];
}
