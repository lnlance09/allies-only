import { logout } from "@actions/authentication"
import { parseJwt } from "@utils/tokenFunctions"
import { Button, Divider, Image, Label, Menu } from "semantic-ui-react"
import { useRouter } from "next/router"
import { Provider, connect } from "react-redux"
import DefaultPic from "@public/images/avatar/small/chris.jpg"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import Router from "next/router"
import store from "@store"

const Sidebar: React.FunctionComponent = ({ activeItem, basic, inverted, loading, logout }) => {
	const router = useRouter()

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
	}, [])

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
			<div className="pageHeader">
				<Menu
					borderless
					className="globalHeader"
					fluid
					inverted={inverted}
					size="huge"
					vertical
				>
					{!basic && (
						<Fragment>
							<Menu.Item
								active={activeItem === "allies"}
								className="headerMenuItem allies"
								onClick={() => router.push("/allies")}
							>
								Allies
								<Label color="yellow" size="large">
									1
								</Label>
							</Menu.Item>
							<Menu.Item
								active={activeItem === "interactions"}
								className="headerMenuItem interactions"
								onClick={() => router.push("/interactions")}
							>
								Interactions
							</Menu.Item>
							<Menu.Item
								active={activeItem === "departments"}
								className="headerMenuItem departments"
								onClick={() => router.push("/departments")}
							>
								Departments
							</Menu.Item>
							<Menu.Item
								active={activeItem === "officers"}
								className="headerMenuItem officers"
								onClick={() => router.push("/officers")}
							>
								Officers
							</Menu.Item>
							{LoginButton()}
						</Fragment>
					)}
				</Menu>
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
