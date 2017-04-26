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
		type: s.TEXT,
		references: {
			model: 'post',
			key: 'creationTs'
		}
	},
	username: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		references: {
			model: 'profile',
			key: 'username'
		}
	},
	url: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		references: {
			model: 'profile',
			key: 'url'
		}
	}
}