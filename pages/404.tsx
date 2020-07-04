import { Container, Header } from "semantic-ui-react"
import { s3BaseUrl } from "@options/config"
import { withTheme } from "@redux/ThemeProvider"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React from "react"

const NotFound: React.FC = ({ inverted }) => {
	return (
		<DefaultLayout
			activeItem={null}
			containerClassName="404Page"
			seo={{
				description: "Not found",
				image: {
					height: 500,
					src: `${s3BaseUrl}logos/logo.png`,
					width: 500
				},
				title: "404",
				url: ""
			}}
			showFooter={false}
		>
			<Container>
				<Header as="h1" inverted={inverted} size="huge" textAlign="center">
					This page does not exist
				</Header>
			</Container>
		</DefaultLayout>
	)
}

NotFound.propTypes = {
	inverted: PropTypes.bool
}

export default withTheme("dark")(NotFound)
