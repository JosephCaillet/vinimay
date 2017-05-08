"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s = require("sequelize");
module.exports = {
    username: {
        type: s.TEXT,
        primaryKey: true
    },
    url: {
        type: s.TEXT,
        primaryKey: true
    },
    description: s.TEXT
};
