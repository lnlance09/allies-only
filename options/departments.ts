export const fetchDepartments = async (q) => {
	const response = await fetch(`/api/department/search?q=${q}&forOptions=1&page=0`, {
		headers: {
			"Content-Type": "application/json"
		}
	})
	const data = await response.json()
	return data.departments
}
