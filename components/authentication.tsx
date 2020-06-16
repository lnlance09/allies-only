import {
	submitLoginForm,
	submitRegistrationForm,
	submitVerificationForm
} from "@actions/authentication"
import { Button, Divider, Form, Header, Input, Message, Segment } from "semantic-ui-react"
import { Provider, connect } from "react-redux"
import PropTypes from "prop-types"
import React, { Fragment, useCallback, useState } from "react"
import store from "@store"

const Authentication: React.FunctionComponent = (props) => {
	const [buttonText, setButtonText] = useState(props.login ? "Create an account" : "Sign in")
	const [email, setEmail] = useState("")
	const [headerText, setHeaderText] = useState(props.login ? "Sign In" : "Create an account")
	const [loadingLogin, setLoadingLogin] = useState(false)
	const [loadingRegistration, setLoadingRegistration] = useState(false)
	const [login, setLogin] = useState(props.login)
	const [name, setName] = useState("")
	const [password, setPassword] = useState("")
	const [regEmail, setRegEmail] = useState("")
	const [registerText, setRegisterText] = useState(
		props.login ? "New to AlliesOnly?" : "Already have an account?"
	)
	const [regPassword, setRegPassword] = useState("")
	const [status, setStatus] = useState(1)
	const [statusSelected, setStatusSelected] = useState(false)
	const [username, setUsername] = useState("")
	const [verificationCode, setVerificationCode] = useState("")

	const toggleLogin = useCallback(() => {
		const buttonText = login ? "Sign in" : "Create an account"
		const headerText = login ? "Create an account" : "Sign In"
		const registerText = login ? "Already have an account?" : "New to AlliesOnly?"
		setButtonText(buttonText)
		setHeaderText(headerText)
		setRegisterText(registerText)
		setLoadingLogin(false)
		setLoadingRegistration(false)
		setLogin(!login)
	}, [login])

	const submitLoginForm = () => {
		if (email.length > 0 && password.length > 0) {
			setLoadingLogin(true)
			props.submitLoginForm({
				email,
				password
			})
		}
	}

	const submitRegistrationForm = () => {
		setLoadingRegistration(true)
		props.submitRegistrationForm({
			email: regEmail,
			name,
			password: regPassword,
			status,
			username
		})
	}

	const submitVerificationForm = () => {
		if (verificationCode.length === 4) {
			props.submitVerificationForm({
				bearer: props.bearer,
				code: verificationCode
			})
		}
	}

	const InfoBox = () => {
		if (!props.verify) {
			return (
				<Header as="p" className="registerText" inverted={props.inverted}>
					{registerText}{" "}
					<span className="registerLink" onClick={() => toggleLogin()}>
						{buttonText}
					</span>
				</Header>
			)
		}

		return null
	}

	const RaceBox = () => (
		<Form inverted={props.inverted} size="big">
			<Header
				className={`raceHeader ${status === 1 ? "active" : ""}`}
				content="I am a person of color"
				inverted={props.inverted}
				onClick={() => setStatus(1)}
				size="large"
			/>
			<Divider horizontal inverted={props.inverted} section>
				Or
			</Divider>
			<Header
				className={`raceHeader ${status === 2 ? "active" : ""}`}
				content="I am an ally"
				inverted={props.inverted}
				onClick={() => setStatus(2)}
				size="large"
			/>
			<Divider inverted={props.inverted} section />
			<Button
				color="yellow"
				content="Next"
				fluid
				inverted={props.inverted}
				onClick={() => {
					setStatusSelected(true)
				}}
				size="big"
			/>
		</Form>
	)

	const MainForm = () => {
		if (props.verify) {
			return (
				<Form inverted={props.inverted} onSubmit={submitVerificationForm} size="big">
					<Form.Field>
						<Input
							inverted={props.inverted}
							maxLength={4}
							onChange={(e, { value }) => setVerificationCode(value)}
							placeholder="Verification code"
							value={verificationCode}
						/>
					</Form.Field>
					<Button
						color="yellow"
						content="Verify"
						disabled={verificationCode.length !== 4}
						fluid
						inverted={props.inverted}
						size="big"
						type="submit"
					/>
				</Form>
			)
		}

		if (login) {
			return (
				<Form inverted={props.inverted} size="big">
					<Form.Field>
						<Input
							inverted={props.inverted}
							onChange={(e, { value }) => {
								setEmail(value)
							}}
							placeholder="Email or username"
							value={email}
						/>
					</Form.Field>
					<Form.Field>
						<Input
							inverted={props.inverted}
							onChange={(e, { value }) => {
								setPassword(value)
							}}
							placeholder="Password"
							type="password"
							value={password}
						/>
					</Form.Field>
					<Form.Field>
						<Button
							color="yellow"
							content="Sign in"
							fluid
							inverted={props.inverted}
							loading={loadingLogin && !props.loginError}
							onClick={submitLoginForm}
							size="big"
							type="submit"
						/>
					</Form.Field>
				</Form>
			)
		}

		if (statusSelected) {
			return (
				<Fragment>
					<Form inverted={props.inverted} size="big">
						<Form.Field>
							<Input
								inverted={props.inverted}
								onChange={(e, { value }) => {
									setRegEmail(value)
								}}
								placeholder="Email"
								value={regEmail}
							/>
						</Form.Field>
						<Form.Field>
							<Input
								inverted={props.inverted}
								onChange={(e, { value }) => {
									setRegPassword(value)
								}}
								value={regPassword}
								placeholder="Password"
								type="password"
							/>
						</Form.Field>
						<Form.Field>
							<Input
								autoComplete="off"
								inverted={props.inverted}
								onChange={(e, { value }) => {
									setName(value)
								}}
								placeholder="Full name"
								value={name}
							/>
						</Form.Field>
						<Form.Field>
							<Input
								inverted={props.inverted}
								onChange={(e, { value }) => {
									setUsername(value)
								}}
								placeholder="Username"
								value={username}
							/>
						</Form.Field>
					</Form>
					<Divider inverted={props.inverted} />
					<Button
						color="yellow"
						content="Create an account"
						fluid
						inverted={props.inverted}
						loading={loadingRegistration && !props.registerError}
						onClick={submitRegistrationForm}
						size="big"
					/>
				</Fragment>
			)
		}

		return <Fragment>{RaceBox()}</Fragment>
	}

	return (
		<Provider store={store}>
			<div className="authComponent">
				{!statusSelected && !login ? null : (
					<Header as="h1" inverted={props.inverted} size="huge">
						{props.verify ? "Verify your email" : headerText}
					</Header>
				)}
				<Segment basic className="authSegment" inverted={props.inverted}>
					{MainForm()}
				</Segment>
				{InfoBox()}
			</div>
		</Provider>
	)
}

Authentication.propTypes = {
	bearer: PropTypes.string,
	inverted: PropTypes.bool,
	login: PropTypes.bool,
	loginError: PropTypes.bool,
	loginErrorMsg: PropTypes.string,
	registerError: PropTypes.bool,
	registerErrorMsg: PropTypes.string,
	submitLoginForm: PropTypes.func,
	submitRegistrationForm: PropTypes.func,
	submitVerificationForm: PropTypes.func,
	verify: PropTypes.bool,
	verifyError: PropTypes.bool,
	verifyErrorMsg: PropTypes.string
}

Authentication.defaultProps = {
	inverted: false,
	login: false,
	submitLoginForm,
	submitRegistrationForm,
	submitVerificationForm
}

const mapStateToProps = (state: any, ownProps: any) => ({
	...state.authentication,
	...ownProps
})

export default connect(mapStateToProps, {
	submitLoginForm,
	submitRegistrationForm,
	submitVerificationForm
})(Authentication)
