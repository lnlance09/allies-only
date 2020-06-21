import axios from "axios"

export const fetchCities = async (q: string) => {
	const data = await axios.get("/api/location/search", {
		params: {
			q
		}
	})
	return data.data.locations
}
