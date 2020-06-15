import { logout } from "@actions/authentication"
import { parseJwt } from "@utils/tokenFunctions"
import { Button, Container, Dropdown, Image, Menu } from "semantic-ui-react"
import { useRouter } from "next/router"
import { Provider, connect } from "react-redux"
import DefaultPic from "@public/images/avatar/small/chris.jpg"
import Link from "next/link"
import Logo from "@public/images/logos/jackie-chan-light-blue.svg"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"
import Router from "next/router"
import store from "@store"

const Header: React.FunctionComponent = ({ basic, inverted, loading, logout }) => {
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
			const trigger = (
				<Image
					avatar
					bordered
					onError={(i) => (i.target.src = DefaultPic)}
					src={DefaultPic}
				/>
			)

			return (
				<Menu.Item className="loginItem" position="right">
					<Dropdown
						className={`dropDownMenu ${inverted ? "inverted" : ""}`}
						icon={false}
						pointing="top right"
						trigger={trigger}
					>
						<Dropdown.Menu>
							<Dropdown.Item
								onClick={() => router.push(`/artists/${username}`)}
								text="Profile"
							/>
							<Dropdown.Item
								onClick={() => {
									localStorage.removeItem("jwtToken")
									logout()
									Router.reload(window.location.pathname)
								}}
								text="Log out"
							/>
						</Dropdown.Menu>
					</Dropdown>
				</Menu.Item>
			)
		}

		return (
			<Menu.Item className="headerMenuItem signInLink" direction="right" position="right">
				<Button
					color="blue"
					content="Become an ally"
					inverted={inverted}
					onClick={() => router.push("/signin?type=join")}
				/>
			</Menu.Item>
		)
	}

	return (
		<Provider store={store}>
			<div className="pageHeader">
				<div className="rainbow" />
				{loading && (
					<Fragment>
						<div className="subline inc" />
						<div className="subline dec" />
					</Fragment>
				)}

				{basic ? (
					<Container className="headerContainer basic" textAlign="center">
						<Image
							className="headerLogo basic"
							inline
							onClick={() => router.push("/")}
							src={Logo}
						/>
					</Container>
				) : (
					<Fragment>
						<Menu
							borderless
							className="globalHeader"
							fitted="vertically"
							fixed="top"
							inverted={inverted}
						>
							<Container className="headerContainer">
								<Menu.Item className="headerMenuItem home">
									<div className="parallelogram">
										<Link href="/">
											<span className="alliesText">
												<a>Allies</a>
											</span>
										</Link>
										<Link href="/">
											<span className="onlyText">
												<a>Only</a>
											</span>
										</Link>
									</div>
								</Menu.Item>
								<Menu.Item className="headerMenuItem departments">
									<Link href="/departments">
										<a>Departments</a>
									</Link>
								</Menu.Item>
								<Menu.Item className="headerMenuItem officers">
									<Link href="/officers">
										<a>Officers</a>
									</Link>
								</Menu.Item>
								<Menu.Item className="headerMenuItem interactions">
									<Link href="/interactions">
										<a>Interactions</a>
									</Link>
								</Menu.Item>
								{LoginButton()}
							</Container>
						</Menu>
					</Fragment>
				)}
			</div>
		</Provider>
	)
}

Header.propTypes = {
	basic: PropTypes.bool,
	inverted: PropTypes.bool,
	loading: PropTypes.bool,
	logout: PropTypes.func
}

Header.defaultProps = {
	basic: false,
	loading: false,
	logout
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.authentication,
	...ownProps
})

export default connect(mapStateToProps, { logout })(Header)
