module.exports = (sequelize, Sequelize) => {
	const OfficerInteraction = sequelize.define(
		"officerInteraction",
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
				unique: true
			},
			interactionId: {
				type: Sequelize.INTEGER
			},
			officerId: {
				type: Sequelize.INTEGER
			}
		},
		{
			createdAt: false,
			updatedAt: false
		}
	)

	OfficerInteraction.associate = (models) => {
		OfficerInteraction.belongsTo(models.interaction, { foreignKey: "interactionId" })
		OfficerInteraction.belongsTo(models.officer, { as: "officers", foreignKey: "officerId" })
	}

	return OfficerInteraction
}
