import { Header, Input, Search, Segment } from "semantic-ui-react"
import { fetchDepartments } from "@options/departments"
import { fetchOfficers } from "@options/officers"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import Router from "next/router"
import useDebounce from "@utils/debounce"

const resultRenderer = ({ departmentName, name, type }) => {
	return (
		<div className="searchItem">
			<Header inverted size="tiny">
				{name}
				<Header.Subheader>
					{type === "officer" ? (
						<Fragment>{departmentName}</Fragment>
					) : (
						<Fragment></Fragment>
					)}
				</Header.Subheader>
			</Header>
		</div>
	)
}

resultRenderer.propTypes = {
	departmentName: PropTypes.string,
	name: PropTypes.string,
	type: PropTypes.string
}

const categoryRenderer = ({ name }) => {
	return (
		<Segment basic className="categoryItem">
			<Header inverted>{name}</Header>
		</Segment>
	)
}

categoryRenderer.propTypes = {
	name: PropTypes.string
}

const Autocomplete: React.FunctionComponent = ({ category, disabled, placeholder, width }) => {
	const [loading, setLoading] = useState(false)
	const [q, setQ] = useState("")
	const [results, setResults] = useState([])
	const debouncedSearchTerm = useDebounce(q, 500)

	useEffect(() => {
		if (debouncedSearchTerm) {
			setLoading(true)
			fetchResults()
		} else {
			setResults([])
		}
	}, [debouncedSearchTerm])

	const fetchResults = async () => {
		const departments = await fetchDepartments({
			q: debouncedSearchTerm,
			forAutocomplete: 1,
			forOptions: 0
		})
		const officers = await fetchOfficers({
			q: debouncedSearchTerm,
			forAutocomplete: 1,
			forOptions: 0
		})
		const results = {}
		if (departments.length > 0) {
			results.departments = { name: "Departments", results: departments }
		}
		if (officers.length > 0) {
			results.officers = { name: "Officers", results: officers }
		}
		setResults(results)
		setLoading(false)
	}

	const onClick = (e, data) => {
		const link = `/pages/youtube/${data.result.social_media_id}`
		Router.push(link)
	}

	return (
		<div style={{ width: `${width}` }}>
			<Search
				category={category}
				categoryRenderer={categoryRenderer}
				className="autocompleteComponent inverted"
				input={
					<Input
						disabled={disabled}
						fluid
						icon="search"
						iconPosition="left"
						inverted
						placeholder={placeholder}
						size="big"
					/>
				}
				loading={loading}
				minCharacters={3}
				onSearchChange={(e, { value }) => setQ(value)}
				onResultSelect={onClick}
				results={results}
				resultRenderer={resultRenderer}
				showNoResults={false}
				size="big"
			/>
		</div>
	)
}

Autocomplete.propTypes = {
	category: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	defaultValue: PropTypes.string,
	disabled: PropTypes.bool,
	placeholder: PropTypes.string,
	width: PropTypes.string
}

Autocomplete.defaultProps = {
	category: true,
	disabled: false,
	placeholder: "Search",
	width: "100%"
}

export default Autocomplete
