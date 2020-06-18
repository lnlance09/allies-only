import axios from "axios"

export const fetchDepartments = async ({ forAutocomplete = 0, forOptions = 1, q }) => {
	const data = await axios.get("/api/department/search", {
		params: {
			forAutocomplete,
			forOptions,
			page: 0,
			q
		}
	})
	return data.data.departments
}
