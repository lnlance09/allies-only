import { Container, Grid, Image } from "semantic-ui-react"
import { useRouter } from "next/router"
import Autocomplete from "@components/autocomplete"
import Logo from "@public/images/logos/logo_72x72.png"
import PropTypes from "prop-types"
import React, { Fragment } from "react"

const PageHeader: React.FunctionComponent = ({ basicHeader, loading }) => {
	const router = useRouter()

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
				<Container className={`${basicHeader ? "basic" : ""}`}>
					{basicHeader ? (
						<Image className="logo" onClick={() => router.push("/")} src={Logo} />
					) : (
						<Grid stackable>
							<Grid.Column className="logoColumn" width={4}>
								<Image
									className="logo"
									onClick={() => router.push("/")}
									src={Logo}
								/>
							</Grid.Column>
							<Grid.Column className="inputColumn" width={12}>
								<Autocomplete category />
							</Grid.Column>
						</Grid>
					)}
				</Container>
			</div>
		</div>
	)
}

PageHeader.propTypes = {
	basicHeader: PropTypes.bool,
	loading: PropTypes.bool
}

export default PageHeader
