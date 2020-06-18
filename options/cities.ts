export const fetchCities = async (q: string) => {
	const response = await fetch(`/api/location/search?q=${q}`, {
		headers: {
			"Content-Type": "application/json"
		}
	})
	const data = await response.json()
	return data.locations
}
