import { Autocomplete } from "./Autocomplete.jsx";

const STYLE_CONTAINER = "max-w-md mx-auto"
  + " flex flex-col items-center" // layout
	+ " bg-gradient-to-r from-fuchsia-300 to-purple-300" // background
  + " border border-white shadow-xl" // border
	+ " p-6 rounded"; // shape
const STYLE_HEADING = "text-xl text-slate-800 font-bold mb-3";

/**
 * @typedef {object} LocationOption
 * @property {string} geonameid
 * @property {string} name
 * @property {string} latitude
 * @property {string} longitude
 */

/** @type {import("./Autocomplete").LoadOptionsFn<LocationOption>} */
async function loadOptions(searchTerm, { signal }) {
	return fetch(`/locations?q=${searchTerm}`, { signal })
		// TODO: should really validate that the JSON is actually Array<LocationOption>
		.then((res) => res.json( ));
}

/** Just used to alert the user to what they selected, for fun. */
const stringify = (thing) => JSON.stringify(thing, null, 2);

export function App( ) {
	return (
		<main className={STYLE_CONTAINER}>
			<h1 className={STYLE_HEADING}>Medicspot Geolocation Search</h1>
			<Autocomplete loadOptions={loadOptions}
				messagePlaceholder="Search for a location"
				messageLoading="Searching..."
				messageErrored="Failed to load locations"
				messageEmpty="No matching locations found."
				getOptionId={(location) => location.geonameid}
				getOptionName={(location) => location.name}
				getOptionDescription={(location) => `${location.latitude}, ${location.longitude}`}
				// eslint-disable-next-line no-alert -- just for fun
				onOptionSelected={(location) => alert(`You selected: ${stringify(location)}`)}
			/>
		</main>
	);
}
