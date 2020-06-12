module.exports = (sequelize, Sequelize) => {
	const Template = sequelize.define(
		"template",
		{
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				unique: true
			},
			createdBy: {
				type: Sequelize.INTEGER
			},
			hash: {
				type: Sequelize.STRING
			},
			name: {
				type: Sequelize.CHAR
			},
			s3Link: {
				type: Sequelize.CHAR
			}
		},
		{
			updatedAt: false
		}
	)

	Template.associate = (models) => {
		Template.belongsTo(models.user, { foreignKey: "createdBy" })
	}

	return Template
}
