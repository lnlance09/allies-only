import axios from "axios"
import { DropdownOptionsPayload } from "@interfaces/options"

export const fetchCities = async (q: string): DropdownOptionsPayload => {
	const data = await axios.get("/api/location/search", {
		params: {
			q
		}
	})
	return data.data.locations
}
