import axios from "axios"

export const fetchUsers = async ({ forAutocomplete = 0, forOptions = 1, q, userId }) => {
	const data = await axios.get("/api/user/search", {
		params: {
			forAutocomplete,
			forOptions,
			page: 0,
			q,
			userId
		}
	})
	return data.data.users
}
