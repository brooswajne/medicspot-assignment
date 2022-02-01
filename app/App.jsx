import { Autocomplete } from "./Autocomplete.jsx";

const STYLE_CONTAINER = "max-w-md mx-auto"
  + " flex flex-col items-center" // layout
	+ " bg-gradient-to-r from-fuchsia-300 to-purple-300" // background
  + " border border-white shadow-xl" // border
	+ " p-6 rounded"; // shape
const STYLE_HEADING = "text-xl text-slate-800 font-bold mb-3";

/** @type {import("./Autocomplete").LoadOptionsFn} */
async function loadOptions(searchTerm, { signal }) {
	return fetch(`/locations?q=${searchTerm}`, { signal })
		.then((res) => res.json( ));
}

export function App( ) {
	return (
		<main className={STYLE_CONTAINER}>
			<h1 className={STYLE_HEADING}>Medicspot Geolocation Search</h1>
			<Autocomplete loadOptions={loadOptions}
				messagePlaceholder="Search for a location"
				messageLoading="Searching..."
				messageErrored="Failed to load locations"
				messageEmpty="No matching locations found."
			/>
		</main>
	);
}
