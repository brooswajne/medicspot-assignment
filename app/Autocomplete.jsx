import {
	Listbox,
	Transition,
} from "@headlessui/react";
import {
	useEffect,
	useState,
} from "react";

import { useDebouncedState } from "./utils/hooks.js";

const STYLE_OPTION = "p-2 rounded"
	+ " transition hover:bg-white";
const STYLE_OPTION_NAME = "text-sm";
const STYLE_OPTION_DESCRIPTION = "text-xs opacity-50";

/**
 * A single autocomplete option.
 * @template TOption
 * @param {object} props
 * @param {TOption} props.option
 * @param {string} props.name
 * @param {string} props.description
 */
function AutocompleteOption({ option, name, description }) {
	return (
		<Listbox.Option value={option} className={STYLE_OPTION}>
			<div className={STYLE_OPTION_NAME}>{name}</div>
			<div className={STYLE_OPTION_DESCRIPTION}>{description}</div>
		</Listbox.Option>
	);
}

const STYLE_INPUT = "rounded p-2";
const STYLE_OPTIONS = "absolute mt-1"
	+ " w-full max-h-36 overflow-auto"
	+ " bg-white/75 backdrop-blur-sm"
	+ " rounded shadow-md";
const STYLE_MESSAGE = "block w-full p-2 opacity-75 text-sm";
const STYLE_ERROR = `${STYLE_MESSAGE} text-red-600`;

/** @typedef {'loading' | 'loaded' | 'errored'} AutocompleteStatus */
/**
 * @typedef {object} LoadOptionsContext
 * @property {AbortSignal} signal
 * An AbortSignal which will be aborted if the request to load the options
 * is no longer relevant.
 */
/**
 * @template TOption
 * @callback LoadOptionsFn
 * @param {string} searchTerm
 * @param {LoadOptionsContext} context
 * @returns {Promise<TOption[]>}
 */

/**
 * A generic autocomplete component used by users to filter down a list
 * of options to find the one they are looking for.
 * @template TOption
 * @param {object} props
 * @param {LoadOptionsFn<TOption>} props.loadOptions
 * A function which is called when the user enters a search query, and
 * should resolve to the options which should be displayed to the user
 * for that query.
 * @param {string} props.messagePlaceholder
 * The text input's placeholder text.
 * @param {string} props.messageLoading
 * The message to be shown to the user while the options are loading.
 * @param {string} props.messageErrored
 * The message to be shown to the user when the options have failed to
 * load.
 * @param {string} props.messageEmpty
 * The message to be shown to the user when the options loaded successfully
 * but none were found matching their query.
 * @param {(option: TOption) => string} props.getOptionId
 * Given a single option, returns its unique ID to identify it within the
 * autocomplete dropdown.
 * @param {(option: TOption) => string} props.getOptionName
 * Given a single option, returns its name to be displayed to the user.
 * @param {(option: TOption) => string} props.getOptionDescription
 * Given a single option, returns its extended description as it should
 * be displayed to the user.
 * @param {(option: TOption) => void} props.onOptionSelected
 * A callback which will be called when an option has been selected by the user.
 */
export function Autocomplete({
	getOptionDescription,
	getOptionId,
	getOptionName,
	loadOptions,
	messageEmpty,
	messageErrored,
	messageLoading,
	messagePlaceholder,
	onOptionSelected,
}) {
	const [ isOpen, setIsOpen ] = useState(false);
	const [ status, setStatus ] = useState(/** @type {AutocompleteStatus} */ ("loading"));
	const [ searchTerm, setSearchTerm ] = useDebouncedState("", { delay: 200 });
	const [ options, setOptions ] = useState(/** @type {TOption[]} */ ([ ]));

	useEffect(function updateOptions( ) {
		setStatus("loading");

		const controller = new AbortController( );
		const { signal } = controller;
		loadOptions(searchTerm, { signal }).then(function onceOptionsLoaded(options) {
			const isRelevant = !signal.aborted;
			if (!isRelevant) return;

			setOptions(options);
			setStatus("loaded");
		}).catch(function handleLoadOptionsFailure(err) {
			const isRelevant = !signal.aborted;
			if (!isRelevant) return;

			// eslint-disable-next-line no-console -- no better error reporting mechanism yet
			console.error(`Error when searching for locations matching "${searchTerm}":`, err);

			setStatus("errored");
		});
		return ( ) => controller.abort( );
	}, [ searchTerm ]);

	/** Contents of the autocomplete options drop-down container. */
	function AutocompleteContents( ) {
		switch (status) {
		case "loaded": return options.length
			? options.map((option) => (<AutocompleteOption option={option}
				key={getOptionId(option)}
				name={getOptionName(option)}
				description={getOptionDescription(option)}>
			</AutocompleteOption>))
			: <span className={STYLE_MESSAGE}>{messageEmpty}</span>;
		case "loading": return (<span className={STYLE_MESSAGE}>{messageLoading}</span>);
		case "errored": return (<span className={STYLE_ERROR}>{messageErrored}</span>);
		// shouldn't happen if type-check passes
		default: throw new Error(`Unknown autocomplete status "${status}"`);
		}
	}

	return (
		<Listbox className="relative" as="div"
			onChange={(option) => onOptionSelected?.(option)}
			onFocus={( ) => setIsOpen(true)}
			onBlur={(e) => setIsOpen(e.currentTarget.contains(e.relatedTarget))}>
			<input type="text"
				className={STYLE_INPUT}
				placeholder={messagePlaceholder}
				onChange={(e) => setSearchTerm(e.target.value)}>
			</input>
			<Transition show={isOpen}
				enter="transition ease-out duration-75"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition ease-in duration-100"
				leaveFrom="opacity-100"
				leaveTo="opacity-0" >
				<Listbox.Options static className={STYLE_OPTIONS}>
					<AutocompleteContents />
				</Listbox.Options>
			</Transition>
		</Listbox>
	);
}
