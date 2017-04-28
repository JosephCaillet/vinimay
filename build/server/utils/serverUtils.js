"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const users_1 = require("../models/users");
const sequelizeWrapper_1 = require("./sequelizeWrapper");
const log = require('printit')({
    date: true
});
function getUsername(request) {
    // Isolate the base64-encoded part
    let basic = request.headers.authorization.split(' ')[1];
    // Decode, then isolate the username
    return new Buffer(basic, 'base64').toString('ascii').split(':')[0];
}
exports.getUsername = getUsername;
function getUser(username) {
    return new Promise((ok, ko) => {
        sequelizeWrapper_1.SequelizeWrapper.getInstance(username).model('user').findOne()
            .then((user) => {
            ok(new users_1.User(user.get('username'), user.get('url')));
        }).catch(ko);
    });
}
exports.getUser = getUser;
function computeSignature(method, url, parameters, token) {
    let params = '';
    for (let param in parameters) {
        if (param.localeCompare('signature')) {
            params += param + '=' + parameters[param] + '&';
        }
    }
    // Removing the trailing '&'
    params = params.substr(0, params.length - 1);
    let toSign = [method.toUpperCase(), url, params].join('&');
    toSign = encodeURIComponent(toSign);
    let signature = crypto.createHmac("sha256", token)
        .update(toSign)
        .digest("hex");
    log.debug('Signature for ' + method.toUpperCase() + ' ' + url + ': ' + signature);
    return signature;
}
exports.computeSignature = computeSignature;
function checkSignature(received, computed) {
    return !computed.localeCompare(received);
}
exports.checkSignature = checkSignature;
