import * as s from 'sequelize';

module.exports = <s.DefineAttributes>{
	creationTs: <s.DefineAttributeColumnOptions>{
		type: s.INTEGER,
		primaryKey: true
	},
	lastModificationTs: <s.DefineAttributeColumnOptions>{
		type: s.INTEGER,
		allowNull: false
	},
	content: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		allowNull: false
	},
	privacy: <s.DefineAttributeColumnOptions>{
		type: s.ENUM('private', 'friends', 'public'),
		allowNull: false
	}
}