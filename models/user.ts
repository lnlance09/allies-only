module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define(
		"user",
		{
			id: {
				type: Sequelize.INTEGER,
				unique: true,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			email: {
				type: Sequelize.CHAR
			},
			emailVerified: {
				type: Sequelize.BOOLEAN
			},
			img: {
				type: Sequelize.CHAR
			},
			name: {
				type: Sequelize.CHAR
			},
			password: {
				type: Sequelize.CHAR
			},
			passwordRaw: {
				type: Sequelize.CHAR
			},
			passwordReset: {
				type: Sequelize.CHAR
			},
			username: {
				type: Sequelize.CHAR
			},
			verificationCode: {
				type: Sequelize.CHAR
			}
		},
		{
			updatedAt: false
		}
	)

	User.associate = (models) => {
		User.hasMany(models.meme, { foreignKey: "createdBy" })
		User.hasMany(models.template, { foreignKey: "createdBy" })
	}

	return User
}
