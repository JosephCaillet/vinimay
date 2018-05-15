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
	id_token: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		allowNull: true
	},
	signature_token: <s.DefineAttributeColumnOptions>{
		type: s.TEXT,
		allowNull: true
	},
	status: <s.DefineAttributeColumnOptions>{
		type: s.ENUM('pending', 'declined', 'incoming', 'accepted', 'following'),
		allowNull: false
	}
}