import * as s from 'sequelize';

module.exports = <s.DefineAttributes>{
	username: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		primaryKey: true,
		references: {
			model: 'profile',
			key: 'username'
		}
	},
	url: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		primaryKey: true,
		references: {
			model: 'profile',
			key: 'url'
		}
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