module.exports = (sequelize, Sequelize) => {
	const TemplateText = sequelize.define(
		"templateText",
		{
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				unique: true
			},
			backgroundColor: {
				type: Sequelize.STRING
			},
			fontColor: {
				type: Sequelize.CHAR
			},
			fontFamily: {
				type: Sequelize.CHAR
			},
			fontSize: {
				type: Sequelize.CHAR
			},
			height: {
				type: Sequelize.INTEGER
			},
			text: {
				type: Sequelize.TEXT
			},
			width: {
				type: Sequelize.INTEGER
			},
			x: {
				type: Sequelize.INTEGER
			},
			y: {
				type: Sequelize.INTEGER
			}
		},
		{
			createdAt: false,
			updatedAt: false
		}
	)

	return TemplateText
}
