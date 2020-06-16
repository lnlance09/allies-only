import { parseJwt } from "@utils/tokenFunctions"
import { withTheme } from "@redux/ThemeProvider"
import { useRouter } from "next/router"
import Authentication from "@components/authentication"
import DefaultLayout from "@layouts/default"
import React, { useEffect, useState } from "react"
import Router from "next/router"

const SignIn: React.FunctionComponent = ({ inverted }) => {
	const router = useRouter()
	const { type } = router.query

	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		const userData = parseJwt()
		if (userData ? userData.emailVerified : false) {
			Router.push("/")
		}

		setLoaded(true)
	}, [loaded])

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
			{loaded && <Authentication inverted={inverted} login={type !== "join"} />}
		</DefaultLayout>
	)
}

export default withTheme("dark")(SignIn)
