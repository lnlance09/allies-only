module.exports = (sequelize, Sequelize) => {
	const Interaction = sequelize.define("interaction", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
			unique: true
		},
		description: {
			type: Sequelize.STRING
		},
		officerId: {
			type: Sequelize.INTEGER
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
		Interaction.belongsTo(models.officer, { foreignKey: "officerId" })
		Interaction.belongsTo(models.user, { foreignKey: "userId" })
	}

	return Interaction
}
