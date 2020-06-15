module.exports = (sequelize, Sequelize) => {
	const Location = sequelize.define(
		"location",
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
			state: {
				allowNull: false,
				type: Sequelize.STRING
			},
			zipCode: {
				type: Sequelize.INTEGER
			}
		},
		{
			createdAt: false,
			updatedAt: false
		}
	)

	return Location
}
