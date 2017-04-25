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
	creationTs: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		primaryKey: true,
		references: {
			model: 'post',
			key: 'creationTs'
		}
	}
}