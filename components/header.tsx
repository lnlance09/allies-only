import { Button, Container, Grid, Icon, Image, Menu, Sidebar } from "semantic-ui-react"
import { useRouter } from "next/router"
import Autocomplete from "@components/autocomplete"
import Logo from "@public/images/logos/logo_72x72.png"
import PropTypes from "prop-types"
import React, { Fragment, useState } from "react"

const PageHeader: React.FunctionComponent = ({ basicHeader, loading }) => {
	const router = useRouter()

	const [sidebarVisible, setSidebarVisible] = useState(false)

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
						<Grid>
							<Grid.Column className="logoColumn" width={3}>
								<Image
									className="logo"
									onClick={() => router.push("/")}
									src={Logo}
								/>
							</Grid.Column>
							<Grid.Column className="inputColumn" width={13}>
								<Icon
									color={sidebarVisible ? "yellow" : null}
									inverted
									name="sidebar"
									onClick={() => setSidebarVisible(!sidebarVisible)}
									size="big"
								/>
							</Grid.Column>
						</Grid>
					)}
				</Container>

				<Sidebar
					as={Menu}
					animation="push"
					borderless
					direction="bottom"
					icon="labeled"
					inverted
					size="huge"
					style={{ textAlign: "left" }}
					vertical
					visible={sidebarVisible}
				>
					<Menu.Item as="a" onClick={() => router.push("/interactions")}>
						Interactions
					</Menu.Item>
					<Menu.Item as="a" onClick={() => router.push("/officers")}>
						Officers
					</Menu.Item>
					<Menu.Item as="a" onClick={() => router.push("/departments")}>
						Departments
					</Menu.Item>
					<Menu.Item>
						<Button
							color="yellow"
							content="Become an ally"
							inverted
							onClick={() => router.push("/signin?type=join")}
						/>
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
