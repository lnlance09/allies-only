"use strict"

module.exports = {
	up: async (queryInterface, Sequelize) => {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */

		return queryInterface.addColumn("users", "politicalStatus", Sequelize.INTEGER)
	},

	down: async (queryInterface) => {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */

		return queryInterface.removeColumn("users", "politicalStatus")
	}
}
