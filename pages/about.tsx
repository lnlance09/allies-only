import { Container, Header } from "semantic-ui-react"
import { withTheme } from "@redux/ThemeProvider"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React from "react"

const About: React.FC = ({ inverted }) => {
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

export async function getStaticProps() {
	// Call an external API endpoint to get posts.
	// You can use any data fetching library
	// const res = await fetch("https://.../posts")
	// const posts = await res.json()

	// By returning { props: posts }, the Blog component
	// will receive `posts` as a prop at build time
	return {
		props: {
			inverted: true
		}
	}
}

About.propTypes = {
	inverted: PropTypes.bool
}

export default withTheme("dark")(About)
