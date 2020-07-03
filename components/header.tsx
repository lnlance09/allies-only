import { Button, Container, Grid, Icon, Image, Menu, Sidebar } from "semantic-ui-react"
import { useRouter } from "next/router"
import { parseJwt } from "@utils/tokenFunctions"
import Autocomplete from "@components/autocomplete"
import Logo from "@public/images/logos/logo_72x72.png"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useState } from "react"

const PageHeader: React.FC = ({ basicHeader, loading }) => {
	const router = useRouter()

	const [authenticated, setAuthenticated] = useState(null)
	const [sidebarVisible, setSidebarVisible] = useState(false)

	useEffect(() => {
		const userData = parseJwt()
		if (userData) {
			setAuthenticated(true)
		} else {
			setAuthenticated(false)
		}
	}, [])

	return (
		<div className="pageHeader">
			<div className="rainbow" />
			{loading && (
				<Fragment>
					<div className="subline inc" />
					<div className="subline dec" />
				</Fragment>
			)}

			<div className="topHeader">
				<Container className={`desktop ${basicHeader ? "basic" : ""}`}>
					{basicHeader ? (
						<Image
							className="logo"
							onClick={() => router.push("/")}
							rounded
							src={Logo}
						/>
					) : (
						<Grid stackable>
							<Grid.Column className="logoColumn" width={4}>
								<Image
									className="logo"
									onClick={() => router.push("/")}
									rounded
									src={Logo}
								/>
							</Grid.Column>
							<Grid.Column className="inputColumn" width={12}>
								<Autocomplete category />
							</Grid.Column>
						</Grid>
					)}
				</Container>
				<Container className={`mobile ${basicHeader ? "basic" : ""}`}>
					{basicHeader ? (
						<Image className="logo" onClick={() => router.push("/")} src={Logo} />
					) : (
						<Menu borderless fitted="vertically" fixed="top" fluid inverted>
							<Container>
								<Menu.Item position="left">
									<Image
										className="logo"
										onClick={() => router.push("/")}
										src={Logo}
									/>
								</Menu.Item>
								<Menu.Item position="right">
									{authenticated === false && (
										<Button
											className="allyButton"
											color="yellow"
											compact
											content="Become an ally"
											inverted
											onClick={() => router.push("/signin?type=join")}
										/>
									)}
									<Icon
										color={sidebarVisible ? "yellow" : null}
										inverted
										name="ellipsis horizontal"
										onClick={() => setSidebarVisible(!sidebarVisible)}
										size="big"
									/>
								</Menu.Item>
							</Container>
						</Menu>
					)}
				</Container>

				<Sidebar
					as={Menu}
					animation="push"
					borderless
					direction="bottom"
					icon="labeled"
					inverted
					onHide={() => setSidebarVisible(false)}
					size="massive"
					style={{ textAlign: "left" }}
					vertical
					visible={sidebarVisible}
				>
					<Menu.Item as="a" onClick={() => router.push("/interactions")}>
						<Icon name="film" size="small" />
						Interactions
					</Menu.Item>
					<Menu.Item as="a" onClick={() => router.push("/officers")}>
						<Icon name="user secret" size="small" />
						Officers
					</Menu.Item>
					<Menu.Item as="a" onClick={() => router.push("/allies")}>
						<Icon name="user circle" size="small" />
						Allies
					</Menu.Item>
					<Menu.Item as="a" onClick={() => router.push("/departments")}>
						<Icon name="building" size="small" />
						Departments
					</Menu.Item>
					<Menu.Item as="a" onClick={() => router.push("/interactions/create")}>
						<Icon name="plus" size="small" />
						Add an interaction
					</Menu.Item>
				</Sidebar>
			</div>
		</div>
	)
}

PageHeader.propTypes = {
	basicHeader: PropTypes.bool,
	loading: PropTypes.bool
}

export default PageHeader
