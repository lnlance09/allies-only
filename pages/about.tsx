import { Container, Header } from "semantic-ui-react"
import { withTheme } from "@redux/ThemeProvider"
import DefaultLayout from "@layouts/default"
import React from "react"

const About: React.FunctionComponent = ({ inverted }) => {
	return (
		<DefaultLayout
			activeItem={null}
			containerClassName="aboutPage"
			seo={{
				description: "About Allies Only. How it works and what our goals are.",
				image: {
					height: 500,
					src: "/public/images/logos/logo.png",
					width: 500
				},
				title: "About",
				url: "about"
			}}
			showFooter={false}
		>
			<Container>
				<Header as="h1" inverted={inverted} size="huge">
					About Us
				</Header>

				<Header as="p" inverted={inverted}></Header>

				<Header as="h2" inverted={inverted} size="huge">
					Our Goal
				</Header>

				<Header as="p" inverted={inverted}></Header>
			</Container>
		</DefaultLayout>
	)
}

export default withTheme("dark")(About)
