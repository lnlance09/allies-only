module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define("user", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
			unique: true
		},
		bio: {
			defaultValue: "",
			type: Sequelize.TEXT
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
		User.hasMany(models.comment, { foreignKey: "userId" })
		User.hasMany(models.commentLike, { foreignKey: "userId" })
		User.hasMany(models.interaction, { foreignKey: "userId" })
	}

	return User
}
