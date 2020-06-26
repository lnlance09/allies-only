import { logout } from "@actions/authentication"
import { parseJwt } from "@utils/tokenFunctions"
import { Button, Divider, Icon, List, Menu, Statistic } from "semantic-ui-react"
import { useRouter } from "next/router"
import { Provider, connect } from "react-redux"
import axios from "axios"
import Link from "next/link"
import NumberFormat from "react-number-format"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import Router from "next/router"
import store from "@store"

const Sidebar: React.FunctionComponent = ({ activeItem, basic, inverted, logout }) => {
	const router = useRouter()

	const [allyCount, setAllyCount] = useState(null)
	const [authenticated, setAuthenticated] = useState(null)
	const [user, setUser] = useState({})

	useEffect(() => {
		const userData = parseJwt()
		if (userData) {
			setUser(userData)
			setAuthenticated(true)
		} else {
			setAuthenticated(false)
		}

		getAllyCount()
	}, [])

	const getAllyCount = async () => {
		const data = await axios.get("/api/user/count")
		setAllyCount(data.data.count)
	}

	const { username } = user

	const LoginButton = () => {
		if (authenticated) {
			return (
				<Fragment>
					<Divider inverted={inverted} />
					<Menu.Item
						active={activeItem === "profile"}
						className="headerMenuItem profile"
						onClick={() => router.push(`/${username}`)}
					>
						Profile
					</Menu.Item>
					<Menu.Item
						className="loginItem"
						onClick={() => {
							localStorage.removeItem("jwtToken")
							logout()
							Router.reload(window.location.pathname)
						}}
					>
						Sign out
					</Menu.Item>
				</Fragment>
			)
		}

		if (authenticated === false) {
			return (
				<Fragment>
					<Menu.Item className="headerMenuItem signIn">
						<Button
							color="yellow"
							content="Become an ally"
							fluid
							inverted={inverted}
							onClick={() => router.push("/signin?type=join")}
							size="big"
						/>
					</Menu.Item>
					<Divider horizontal inverted={inverted}>
						Or
					</Divider>
					<Menu.Item className="headerMenuItem signIn">
						<Button
							color="orange"
							content="Sign In"
							fluid
							inverted={inverted}
							onClick={() => router.push("/signin")}
							size="big"
						/>
					</Menu.Item>
				</Fragment>
			)
		}
		return null
	}

	return (
		<Provider store={store}>
			<div className="pageSidebar">
				<Menu
					borderless
					className="globalSidebar"
					fluid
					inverted={inverted}
					size="massive"
					vertical
				>
					{!basic && (
						<Fragment>
							<Menu.Item
								active={activeItem === "addInteraction"}
								className="headerMenuItem addInteraction"
								onClick={() => router.push("/interactions/create")}
							>
								<Icon
									color={activeItem === "addInteraction" ? "yellow" : null}
									inverted={inverted}
									name="plus"
								/>
								Add Interaction
							</Menu.Item>
							<Menu.Item
								active={activeItem === "allies"}
								className="headerMenuItem allies"
								onClick={() => router.push("/allies")}
							>
								<Icon
									color={activeItem === "allies" ? "yellow" : null}
									inverted={inverted}
									name="user circle"
								/>
								Allies
							</Menu.Item>
							<Menu.Item
								active={activeItem === "interactions"}
								className="headerMenuItem interactions"
								onClick={() => router.push("/interactions")}
							>
								<Icon
									color={activeItem === "interactions" ? "yellow" : null}
									inverted={inverted}
									name="film"
								/>
								Interactions
							</Menu.Item>
							<Menu.Item
								active={activeItem === "departments"}
								className="headerMenuItem departments"
								onClick={() => router.push("/departments")}
							>
								<Icon
									color={activeItem === "departments" ? "yellow" : null}
									inverted={inverted}
									name="building"
								/>
								Departments
							</Menu.Item>
							<Menu.Item
								active={activeItem === "officers"}
								className="headerMenuItem officers"
								onClick={() => router.push("/officers")}
							>
								<Icon
									color={activeItem === "officers" ? "yellow" : null}
									inverted={inverted}
									name="user secret"
								/>
								Officers
							</Menu.Item>
							{LoginButton()}
						</Fragment>
					)}
				</Menu>

				<List className="aboutList" horizontal inverted={inverted}>
					<List.Item>
						<Link href="/about">
							<a>About</a>
						</Link>
					</List.Item>
					<List.Item>
						<Link href="/contact">
							<a>Contact</a>
						</Link>
					</List.Item>
					<List.Item>© 2020, Allies Only</List.Item>
				</List>

				{allyCount !== null && !authenticated ? (
					<div style={{ textAlign: "center" }}>
						<Statistic inverted={inverted}>
							<Statistic.Value>
								<NumberFormat
									displayType={"text"}
									thousandSeparator={true}
									value={allyCount}
								/>
							</Statistic.Value>
							<Statistic.Label>Allies</Statistic.Label>
						</Statistic>
					</div>
				) : null}
			</div>
		</Provider>
	)
}

Sidebar.propTypes = {
	activeItem: PropTypes.string,
	basic: PropTypes.bool,
	inverted: PropTypes.bool,
	loading: PropTypes.bool,
	logout: PropTypes.func
}

Sidebar.defaultProps = {
	activeItem: "",
	basic: false,
	loading: false,
	logout
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.authentication,
	...ownProps
})

export default connect(mapStateToProps, { logout })(Sidebar)
