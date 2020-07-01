module.exports = (sequelize, Sequelize) => {
	const Officer = sequelize.define(
		"officer",
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
				unique: true
			},
			badgeNumber: {
				type: Sequelize.STRING
			},
			createdBy: {
				type: Sequelize.INTEGER
			},
			departmentId: {
				type: Sequelize.INTEGER
			},
			firstName: {
				type: Sequelize.STRING
			},
			img: {
				type: Sequelize.STRING
			},
			lastName: {
				type: Sequelize.STRING
			},
			position: {
				type: Sequelize.STRING
			},
			slug: {
				type: Sequelize.STRING
			}
		},
		{
			updatedAt: false
		}
	)

	Officer.associate = (models) => {
		Officer.belongsTo(models.department, { foreignKey: "departmentId" })
		Officer.belongsTo(models.user, { foreignKey: "createdBy" })
		Officer.hasMany(models.officerInteraction, { foreignKey: "officerId" })
	}

	return Officer
}
