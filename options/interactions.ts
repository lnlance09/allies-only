import axios from "axios"
import { DropdownOption, DropdownOptionsPayload } from "@interfaces/options"

export const fetchInteractions = async ({
	forAutocomplete = 0,
	forOptions = 1,
	id,
	q
}: DropdownOptionsPayload): DropdownOption => {
	const data = await axios.get("/api/interaction/search", {
		params: {
			forAutocomplete,
			forOptions,
			id,
			page: 0,
			q
		}
	})
	return data.data.interactions
}
