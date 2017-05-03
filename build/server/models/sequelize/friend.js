"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s = require("sequelize");
module.exports = {
    username: {
        type: s.TEXT,
        primaryKey: true,
        references: {
            model: 'profile',
            key: 'username'
        }
    },
    url: {
        type: s.TEXT,
        primaryKey: true,
        references: {
            model: 'profile',
            key: 'url'
        }
    },
    id_token: {
        type: s.TEXT,
        allowNull: true
    },
    signature_token: {
        type: s.TEXT,
        allowNull: true
    },
    status: {
        type: s.ENUM('pending', 'declined', 'incoming', 'accepted', 'following'),
        allowNull: false
    }
};
