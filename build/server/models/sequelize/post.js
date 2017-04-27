"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s = require("sequelize");
module.exports = {
    creationTs: {
        type: s.INTEGER,
        primaryKey: true
    },
    lastModificationTs: {
        type: s.INTEGER,
        allowNull: false
    },
    content: {
        type: s.TEXT,
        allowNull: false
    },
    privacy: {
        type: s.ENUM('private', 'friends', 'public'),
        allowNull: false
    }
};
