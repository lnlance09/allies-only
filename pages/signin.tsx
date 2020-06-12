import { parseJwt } from "@utils/tokenFunctions"
import { withTheme } from "@redux/ThemeProvider"
import Authentication from "@components/authentication"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React, { useEffect } from "react"
import Router from "next/router"

const SignIn: React.FunctionComponent = ({ inverted }) => {
	useEffect(() => {
		const userData = parseJwt()
		if (userData ? userData.emailVerified : false) {
			Router.push("/")
		}
	}, [])

	return (
		<DefaultLayout
			basicHeader
			containerClassName="signInPage"
			isText
			seo={{
				description: "Sign in or sign up with Brandy to start creating memes",
				image: {
					height: 512,
					src: "/public/images/logos/default-logo.png",
					width: 512
				},
				title: "Sign In",
				url: "signin"
			}}
			showFooter={false}
			textAlign="center"
		>
			<Authentication inverted={inverted} />
		</DefaultLayout>
	)
}

SignIn.propTypes = {
	inverted: PropTypes.bool
}

export default withTheme("dark")(SignIn)
