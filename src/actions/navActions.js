export function link(name) {
	return {
		type: "NAV_LINK",
		payload: {
			name : name
		}
	}
}