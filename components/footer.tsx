import { Container, List, Segment } from "semantic-ui-react"
import Link from "next/link"
import React from "react"

const Footer: React.FunctionComponent = () => {
	return (
		<Segment attached="bottom" className="footerSegment">
			<Container>
				<List className="footerList" horizontal inverted link>
					<List.Item>
						<Link href="/about">
							<a>About</a>
						</Link>
					</List.Item>
					<List.Item>
						<Link href="/about/privacy">
							<a>Privacy</a>
						</Link>
					</List.Item>
					<List.Item>
						<Link href="/about/rules">
							<a>Rules</a>
						</Link>
					</List.Item>
				</List>
				<p>© 2020 Brandy</p>
			</Container>
		</Segment>
	)
}

export default Footer
