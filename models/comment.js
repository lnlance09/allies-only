module.exports = (sequelize, Sequelize) => {
	const Comment = sequelize.define("comment", {
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
		message: {
			type: Sequelize.TEXT
		},
		userId: {
			type: Sequelize.INTEGER
		}
	})

	Comment.associate = (models) => {
		Comment.belongsTo(models.interaction, { foreignKey: "interactionId" })
		Comment.belongsTo(models.user, { foreignKey: "userId" })
		Comment.hasMany(models.commentResponse, { foreignKey: "responseTo" })
		Comment.hasMany(models.commentLike, { foreignKey: "commentId" })
	}

	return Comment
}
