import axios from "axios"

export const fetchOfficers = async ({ departmentId, forAutocomplete = 0, forOptions = 1, q }) => {
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
