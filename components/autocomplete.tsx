import { Header, Image, Input, Search, Segment } from "semantic-ui-react"
import { fetchUsers } from "@options/users"
import { fetchOfficers } from "@options/officers"
import { s3BaseUrl } from "@options/config"
import AllyPic from "@public/images/avatar/large/joe.jpg"
import OfficerPic from "@public/images/avatar/officer.png"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import Router from "next/router"
import useDebounce from "@utils/debounce"

const categoryRenderer = ({ name }: { name: string }) => {
	return (
		<Segment basic className="categoryItem" fluid>
			<Header inverted>{name}</Header>
		</Segment>
	)
}

categoryRenderer.propTypes = {
	name: PropTypes.string
}

const resultRenderer = ({
	departmentName,
	img,
	name,
	type,
	username
}: {
	departmentName: string,
	img: string,
	name: string,
	type: string,
	username: string
}) => {
	return (
		<div className="searchItem">
			{type === "officer" && (
				<Image
					onError={(i) => (i.target.src = OfficerPic)}
					src={img === null ? OfficerPic : `${s3BaseUrl}${img}`}
				/>
			)}
			{type === "ally" && (
				<Image
					onError={(i) => (i.target.src = AllyPic)}
					src={img === null ? AllyPic : `${s3BaseUrl}${img}`}
				/>
			)}
			<Header inverted size="small">
				{name}
				<Header.Subheader>
					{type === "officer" ? (
						<Fragment>{departmentName}</Fragment>
					) : (
						<Fragment>{username}</Fragment>
					)}
				</Header.Subheader>
			</Header>
		</div>
	)
}

resultRenderer.propTypes = {
	departmentName: PropTypes.string,
	img: PropTypes.string,
	name: PropTypes.string,
	type: PropTypes.string,
	username: PropTypes.string
}

const Autocomplete: React.FC = ({ category, disabled, placeholder, width }) => {
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
		const allies = await fetchUsers({
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
		if (officers.length > 0) {
			results.officers = { name: "Officers", results: officers }
		}
		if (allies.length > 0) {
			results.allies = { name: "Allies", results: allies }
		}
		setResults(results)
		setLoading(false)
	}

	const onClick = (e, data) => {
		const { slug, type, username } = data.result
		let link = `/${username}`
		if (type === "officer") {
			link = `/officers/${slug}`
		}
		Router.push(link)
	}

	return (
		<div style={{ width: `${width}` }}>
			<Search
				category={category}
				categoryRenderer={categoryRenderer}
				className="autocompleteComponent"
				input={
					<Input
						className="autocomplete"
						disabled={disabled}
						fluid
						icon="search"
						iconPosition="left"
						placeholder={placeholder}
					/>
				}
				loading={loading}
				minCharacters={3}
				onSearchChange={(e, { value }) => setQ(value)}
				onResultSelect={onClick}
				results={results}
				resultRenderer={resultRenderer}
				showNoResults={false}
			/>
		</div>
	)
}

Autocomplete.propTypes = {
	category: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	defaultValue: PropTypes.string,
	disabled: PropTypes.bool,
	placeholder: PropTypes.string,
	size: PropTypes.string,
	width: PropTypes.string
}

Autocomplete.defaultProps = {
	category: true,
	disabled: false,
	placeholder: "Search",
	size: "small",
	width: "100%"
}

export default Autocomplete
