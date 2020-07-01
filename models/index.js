"use strict"
/* eslint-disable */
const fs = require("fs")
const path = require("path")
const Sequelize = require("sequelize")
/* eslint-enable */
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || "development"
/* eslint-disable */
const config = require(__dirname + "/../config/config.json")[env]
/* eslint-enable */

const db = {}
let sequelize
if (config.use_env_variable) {
	sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, config)
}

fs.readdirSync(__dirname)
	.filter((file) => {
		return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
	})
	.forEach((file) => {
		const model = sequelize["import"](`${__dirname}/../models/${file}`)
		db[model.name] = model
	})

/*
const departmentModel = sequelize["import"](`${__dirname}/../models/department.js`)
db[departmentModel.name] = departmentModel

const interactionModel = sequelize["import"](`${__dirname}/../models/interaction.js`)
db[interactionModel.name] = interactionModel

const locationModel = sequelize["import"](`${__dirname}/../models/location.js`)
db[locationModel.name] = locationModel

const officerModel = sequelize["import"](`${__dirname}/../models/officer.js`)
db[officerModel.name] = officerModel

const officerInteractionModel = sequelize["import"](`${__dirname}/../models/officerInteraction.js`)
db[officerInteractionModel.name] = officerInteractionModel

const userModel = sequelize["import"](`${__dirname}/../models/user.js`)
db[userModel.name] = userModel
*/

Object.keys(db).forEach((modelName) => {
	if (db[modelName].associate) {
		db[modelName].associate(db)
	}
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
