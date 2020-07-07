module.exports = (sequelize, Sequelize) => {
	const CommentLike = sequelize.define(
		"commentLike",
		{
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
				unique: true
			},
			commentId: {
				type: Sequelize.INTEGER
			},
			responseId: {
				type: Sequelize.INTEGER
			},
			userId: {
				type: Sequelize.INTEGER
			}
		},
		{
			updatedAt: false
		}
	)

	CommentLike.associate = (models) => {
		CommentLike.belongsTo(models.comment, { foreignKey: "commentId" })
		CommentLike.belongsTo(models.commentResponse, { foreignKey: "responseId" })
		CommentLike.belongsTo(models.user, { foreignKey: "userId" })
	}

	return CommentLike
}
