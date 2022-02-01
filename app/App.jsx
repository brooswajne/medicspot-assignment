import React, { useState } from "react";

export function App( ) {
	const [ count, setCount ] = useState(0);

	return (
		<main>
			<h1>Hello world!</h1>
			<button onClick={( ) => setCount((c) => c + 1)}>Count: {count}</button>
		</main>
	);
}
