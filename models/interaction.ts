module.exports = (sequelize, Sequelize) => {
	const Interaction = sequelize.define("interaction", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
			unique: true
		},
		departmentId: {
			type: Sequelize.INTEGER
		},
		description: {
			type: Sequelize.TEXT
		},
		title: {
			type: Sequelize.STRING
		},
		userId: {
			type: Sequelize.INTEGER
		},
		video: {
			type: Sequelize.STRING
		},
		views: {
			type: Sequelize.INTEGER
		}
	})

	Interaction.associate = (models) => {
		Interaction.belongsTo(models.department, { foreignKey: "departmentId" })
		Interaction.hasMany(models.officerInteraction, { foreignKey: "interactionId" })
		Interaction.belongsTo(models.user, { foreignKey: "userId" })
	}

	return Interaction
}
