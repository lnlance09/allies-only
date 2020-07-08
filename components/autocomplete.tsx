import { Header, Image, Input, Search, Segment } from "semantic-ui-react"
import { fetchDepartments } from "@options/departments"
import { fetchInteractions } from "@options/interactions"
import { fetchOfficers } from "@options/officers"
import { fetchUsers } from "@options/users"
import { s3BaseUrl } from "@options/config"
import AllyPic from "@public/images/avatar/large/joe.jpg"
import Link from "next/link"
import OfficerPic from "@public/images/avatar/officer.png"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import Router from "next/router"
import useDebounce from "@utils/debounce"

const categoryRenderer = ({ name }: { name: string }) => {
	const href = `/${name.toLowerCase()}`
	return (
		<Segment basic className={`categoryItem`}>
			<Header inverted>
				{name}

				<Link href={href}>
					<a className="seeMoreSearchResults">view all</a>
				</Link>
			</Header>
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
			{type === "interaction" && (
				<Image
					onError={(i) => (i.target.src = AllyPic)}
					src={img === null ? AllyPic : img}
				/>
			)}
			<Header inverted size="small">
				{name}
				<Header.Subheader>
					{type === "officer" && <Fragment>{departmentName}</Fragment>}
					{type === "ally" && <Fragment>{username}</Fragment>}
					{type === "interaction" && <Fragment>Interaction</Fragment>}
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

const Autocomplete: React.FC = ({ category, disabled, mobileMode, placeholder, width }) => {
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

	useEffect(() => {
		if (mobileMode) {
			fetchResults()
		}
	}, [])

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

		const departments = await fetchDepartments({
			q: debouncedSearchTerm,
			forAutocomplete: 1,
			forOptions: 0
		})

		const interactions = await fetchInteractions({
			q: debouncedSearchTerm,
			forAutocomplete: 1,
			forOptions: 0
		})

		const results = {}
		if (officers.length > 0) {
			results.officers = { name: "Officers", results: officers }
		}
		if (departments.length > 0) {
			results.departments = { name: "Departments", results: departments }
		}
		if (interactions.length > 0) {
			results.interactions = { name: "Interactions", results: interactions }
		}
		if (allies.length > 0) {
			results.allies = { name: "Allies", results: allies }
		}

		setResults(results)
		setLoading(false)
	}

	const onClick = (e: React.SyntheticEvent<EventTarget>, data) => {
		const { id, slug, type, username } = data.result
		let link = `/${username}`
		if (type === "officer") {
			link = `/officers/${slug}`
		}
		if (type === "department") {
			link = `/departments/${slug}`
		}
		if (type === "interaction") {
			link = `/interactions/${id}`
		}
		Router.push(link)
	}

	return (
		<div style={{ width: `${width}` }}>
			<Search
				category={category}
				categoryRenderer={categoryRenderer}
				className="autocompleteComponent"
				defaultOpen={mobileMode}
				input={
					<Input
						autoFocus
						className="autocomplete"
						disabled={disabled}
						fluid
						icon="search"
						iconPosition="left"
						inverted
						placeholder={placeholder}
					/>
				}
				loading={loading}
				minCharacters={3}
				onBlur={() => null}
				onSearchChange={(e, { value }) => setQ(value)}
				onResultSelect={onClick}
				results={results}
				resultRenderer={resultRenderer}
			/>
		</div>
	)
}

Autocomplete.propTypes = {
	category: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	defaultValue: PropTypes.string,
	disabled: PropTypes.bool,
	mobileMode: PropTypes.bool,
	placeholder: PropTypes.string,
	size: PropTypes.string,
	width: PropTypes.string
}

Autocomplete.defaultProps = {
	category: true,
	disabled: false,
	mobileMode: false,
	placeholder: "Search",
	size: "small",
	width: "100%"
}

export default Autocomplete
