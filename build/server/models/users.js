"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    constructor(input, instance) {
        if (instance) {
            this._username = input;
            this._instance = instance;
        }
        else {
            let user = input.split('@');
            this._username = user[0];
            this._instance = user[1];
        }
    }
    toString() {
        return this._username + '@' + this._instance;
    }
    get username() {
        return this._username;
    }
    get instance() {
        return this._instance;
    }
}
exports.User = User;
