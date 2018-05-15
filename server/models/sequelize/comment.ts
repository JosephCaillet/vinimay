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
	creationTs_Post: <s.DefineAttributeColumnOptions>{
		type: s.TEXT
	},
	username: <s.DefineAttributeColumnOptions>{
		type: s.TEXT
	},
	url: <s.DefineAttributeColumnOptions>{
		type: s.TEXT
	}
}