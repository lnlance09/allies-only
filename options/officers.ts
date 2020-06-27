import axios from "axios"
import { DropdownOption, DropdownOptionsPayload } from "@interfaces/options"

export const fetchOfficers = async ({
	departmentId,
	forAutocomplete = 0,
	forOptions = 1,
	q
}: DropdownOptionsPayload): DropdownOption => {
	const data = await axios.get("/api/officer/search", {
		params: {
			departmentId,
			forAutocomplete,
			forOptions,
			page: 0,
			q
		}
	})
	return data.data.officers
}
