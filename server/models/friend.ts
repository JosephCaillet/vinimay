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
	id_token: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		allowNull: false
	},
	signature_token: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		allowNull: false
	},
	status: <s.DefineAttributeColumnOptions>{
		type: s.ENUM('pending', 'declined', 'incoming', 'accepted', 'following'),
		allowNull: false
	}
}