module.exports = (sequelize, Sequelize) => {
	const Department = sequelize.define(
		"department",
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
				unique: true
			},
			city: {
				type: Sequelize.STRING
			},
			county: {
				type: Sequelize.STRING
			},
			lat: {
				type: Sequelize.STRING
			},
			lon: {
				type: Sequelize.STRING
			},
			name: {
				allowNull: false,
				type: Sequelize.STRING
			},
			slug: {
				type: Sequelize.STRING
			},
			state: {
				allowNull: false,
				type: Sequelize.STRING
			},
			type: {
				allowNull: false,
				defaultValue: 1,
				type: Sequelize.INTEGER
			},
			zipCode: {
				type: Sequelize.INTEGER
			}
		},
		{
			updatedAt: false
		}
	)

	return Department
}
