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
    password: {
        type: s.TEXT,
        allowNull: false
    },
    salt: {
        type: s.TEXT,
        allowNull: false
    }
};
