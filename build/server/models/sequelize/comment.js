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
    creationTs_Post: {
        type: s.TEXT
    },
    username: {
        type: s.TEXT
    },
    url: {
        type: s.TEXT
    }
};
