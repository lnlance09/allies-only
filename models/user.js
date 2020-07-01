module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define("user", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
			unique: true
		},
		email: {
			type: Sequelize.STRING
		},
		emailVerified: {
			type: Sequelize.BOOLEAN
		},
		img: {
			type: Sequelize.STRING
		},
		name: {
			type: Sequelize.STRING
		},
		password: {
			type: Sequelize.STRING
		},
		passwordRaw: {
			type: Sequelize.STRING
		},
		passwordReset: {
			type: Sequelize.STRING
		},
		race: {
			type: Sequelize.STRING
		},
		username: {
			type: Sequelize.STRING
		},
		verificationCode: {
			type: Sequelize.STRING
		}
	})

	User.associate = (models) => {
		User.hasMany(models.interaction, { foreignKey: "userId" })
	}

	return User
}
