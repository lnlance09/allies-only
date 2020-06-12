module.exports = (sequelize, Sequelize) => {
	const MemeTemplate = sequelize.define(
		"memeTemplate",
		{
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				unique: true
			},
			memeId: {
				type: Sequelize.INTEGER
			},
			templateId: {
				type: Sequelize.INTEGER
			},
			textId: {
				type: Sequelize.INTEGER
			}
		},
		{
			createdAt: false,
			updatedAt: false
		}
	)

	MemeTemplate.associate = (models) => {
		MemeTemplate.belongsTo(models.meme, { as: "meme", foreignKey: "memeId" })
		MemeTemplate.belongsTo(models.template, { as: "template", foreignKey: "templateId" })
		MemeTemplate.belongsTo(models.templateText, { as: "text", foreignKey: "textId" })
	}

	return MemeTemplate
}
