import * as s from 'sequelize';

module.exports = <s.DefineAttributes>{
	username: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		primaryKey: true
	},
	url: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		primaryKey: true
	},
	password: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		allowNull: false
	},
	salt: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		allowNull: false
	}
}