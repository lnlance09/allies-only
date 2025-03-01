"use strict"

module.exports = {
	up: async (queryInterface, Sequelize) => {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */

		return queryInterface.addColumn("departments", "img", Sequelize.STRING)
	},

	down: async (queryInterface) => {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */

		return queryInterface.removeColumn("departments", "img")
	}
}
