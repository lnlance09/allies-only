module.exports = (sequelize, Sequelize) => {
	const Meme = sequelize.define(
		"meme",
		{
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				unique: true
			},
			caption: {
				type: Sequelize.TEXT
			},
			createdBy: {
				type: Sequelize.INTEGER
			},
			name: {
				type: Sequelize.CHAR
			},
			s3Link: {
				type: Sequelize.CHAR
			},
			views: {
				type: Sequelize.BIGINT,
				defaultValue: 1
			}
		},
		{
			updatedAt: false
		}
	)

	Meme.associate = (models) => {
		Meme.belongsTo(models.user, { foreignKey: "createdBy" })
	}

	return Meme
}
