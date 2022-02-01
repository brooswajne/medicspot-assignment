import {
	Listbox,
	Transition,
} from "@headlessui/react";
import { useState } from "react";

const OPTIONS = [
	"Cambridge",
	"Huntingdon",
	"London",
	"Warwick",
];

const STYLE_OPTION = "p-2 rounded"
	+ " transition hover:bg-white";

/**
 * A single autocomplete option.
 * @param {object} props
 * @param {string} props.option
 */
function AutocompleteOption({ option }) {
	return (
		<Listbox.Option value={option} className={STYLE_OPTION}>
			{option}
		</Listbox.Option>
	);
}

const STYLE_INPUT = "rounded p-2";
const STYLE_OPTIONS = "absolute w-full mt-1"
	+ " bg-white/75 backdrop-blur-sm"
	+ " rounded shadow-md";

/**
 * A generic autocomplete component used by users to filter down a list
 * of options to find the one they are looking for.
 * @param {object} [props]
 * @param {string} [props.placeholder]
 * The text input's placeholder text.
 */
export function Autocomplete({ placeholder }) {
	const [ isOpen, setIsOpen ] = useState(false);

	return (
		<Listbox className="relative" as="div"
			// eslint-disable-next-line no-alert -- just for fun
			onChange={(location) => alert(`Selected: ${location}`)}
			onFocus={( ) => setIsOpen(true)}
			onBlur={( ) => setIsOpen(false)}>
			<input type="text"
				className={STYLE_INPUT}
				placeholder={placeholder}>
			</input>
			<Transition show={isOpen}
				enter="transition ease-out duration-75"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition ease-in duration-100"
				leaveFrom="opacity-100"
				leaveTo="opacity-0" >
				<Listbox.Options static className={STYLE_OPTIONS}>
					{OPTIONS.map((option) => (
						<AutocompleteOption key={option} option={option} />
					))}
				</Listbox.Options>
			</Transition>
		</Listbox>
	);
}
