import { Container, Header, Image, List } from "semantic-ui-react"
import { s3BaseUrl } from "@options/config"
import { withTheme } from "@redux/ThemeProvider"
import RodneyKingPic from "@public/images/rodney-king.jpg"
import DefaultLayout from "@layouts/default"
import PropTypes from "prop-types"
import React from "react"

const About: React.FC = ({ inverted }) => {
	return (
		<DefaultLayout
			activeItem={null}
			containerClassName="aboutPage"
			seo={{
				description: "How it works and what our goals are.",
				image: {
					height: 500,
					src: `${s3BaseUrl}logos/logo.png`,
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

				<div className="aboutSection">
					<Header as="p" inverted={inverted}>
						Allies Only is a platform that is used to help document instances of police
						brutality. It is essentially a collection of the following:
					</Header>

					<List bulleted inverted={inverted} size="big">
						<List.Item>Police Departments</List.Item>
						<List.Item>Police Officers</List.Item>
						<List.Item>
							Videos of interactions between police officers and civilians
						</List.Item>
						<List.Item>Allies in the fight against police brutality</List.Item>
					</List>
				</div>

				<Header as="h2" inverted={inverted} size="huge">
					Our Goal
				</Header>

				<Header as="p" inverted={inverted}>
					Our goal is to build an extensive collection of filmed interactions between
					police and civilians so that it becomes abundantly clear to even skeptics,
					naysayers, and police apologists that America has a unique problem when it comes
					to criminal justice.
				</Header>

				<Image src={RodneyKingPic} />

				<Header as="p" inverted={inverted}>
					For every case of an unarmed person like George Floyd being killed by the
					police, there are countless others that don&apos;t receive even a fraction of
					the same news coverage. But, this doesn&apos;t mean that the more obscure cases
					of police brutality aren&apos;t important and should be forgotten about. The
					nature of the 24 hour news cycle makes it so that a handful of cases garner
					national attention and after about a month or so they&apos;re all but fogotten.
				</Header>

				<Header as="p" inverted={inverted}>
					Unlike the days of the early 1990&apos;s when cases like Rodney King&apos;s
					received national attention simply because he was lucky enough to have had
					someone film it, cameras are everywhere now. In the digital age where almost
					everyone has access to a camera thanks to their smart phones, recording everyday
					interactions between the police and civilians is easier than ever. Many police
					officers are required to wear body cams now. The days of simply having to trust
					an officer&apos;s account of how a situation unfolded should be relegated to the
					past.
				</Header>
			</Container>
		</DefaultLayout>
	)
}

About.propTypes = {
	inverted: PropTypes.bool
}

export default withTheme("dark")(About)
