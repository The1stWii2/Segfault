export function isValidURL(input) {
	let url;

	try {
		url = new URL(input);
	} catch (e) {
		return false;
	}

	return url.protocol === "http:" || url.protocol === "https:";
}