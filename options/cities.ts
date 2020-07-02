import axios from "axios"
import { DropdownOption } from "@interfaces/options"

export const fetchCities = async (q: string): DropdownOption => {
	const data = await axios.get("/api/location/search", {
		params: {
			q
		}
	})
	return data.data.locations
}
