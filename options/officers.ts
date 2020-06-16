export const fetchOfficers = async (departmentId, q) => {
	const response = await fetch(
		`/api/officer/search?q=${q}&department=${departmentId}&forOptions=1&page=0`,
		{
			headers: {
				"Content-Type": "application/json"
			}
		}
	)
	const data = await response.json()
	return data.officers
}
