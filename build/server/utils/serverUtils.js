"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const b = require("boom");
const r = require("request-promise-native/errors");
const crypto = require("crypto");
const vinimayError_1 = require("./vinimayError");
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
function getFriendByToken(username, idtoken) {
    return new Promise((ok, ko) => {
        sequelizeWrapper_1.SequelizeWrapper.getInstance(username).model('friend').findOne({ where: {
                id_token: idtoken
            }, raw: true })
            .then((user) => {
            if (user)
                ok(user);
            else
                throw new vinimayError_1.VinimayError('UNKNOWN_TOKEN');
        }).catch(ko);
    });
}
exports.getFriendByToken = getFriendByToken;
function computeSignature(method, url, parameters, token) {
    let params = '';
    // We can't sort an object on its properties' names, so we create an array from it
    let sortable = [];
    for (let param in parameters) {
        sortable.push([param, parameters[param]]);
    }
    // Sort the array
    sortable.sort((a, b) => {
        if (a[0] < b[0])
            return -1;
        if (a[0] > b[0])
            return 1;
        return 0;
    });
    // Build the reference string
    for (let i in sortable) {
        let param = sortable[i];
        if (param[0].localeCompare('signature')) {
            params += param[0] + '=' + param[1] + '&';
        }
    }
    // Removing the trailing '&'
    params = params.substr(0, params.length - 1);
    let toSign = [method.toUpperCase(), url, params].join('&');
    toSign = encodeURIComponent(toSign);
    let signature = crypto.createHmac("sha256", token)
        .update(toSign)
        .digest("hex");
    log.debug('Signature for ' + method.toUpperCase() + ' ' + url + ': ' + signature + ' (using token ' + token + ')');
    return signature;
}
exports.computeSignature = computeSignature;
function checkSignature(received, computed) {
    return !computed.localeCompare(received);
}
exports.checkSignature = checkSignature;
function getGetRequestUrl(user, path, params, sigtoken) {
    let url = user + path;
    let hasParams = !!(Object.keys(params).length || (params.idToken && sigtoken));
    let signature = '';
    if (params.idToken && sigtoken) {
        signature = computeSignature('GET', user + path, params, sigtoken);
    }
    if (hasParams)
        url += '?';
    for (let key in params) {
        url += key + '=' + params[key] + '&';
    }
    if (params.idToken && sigtoken) {
        url += 'signature=' + signature;
    }
    else if (hasParams) {
        url = url.substr(0, url.length - 1);
    }
    return url;
}
exports.getGetRequestUrl = getGetRequestUrl;
// Prints the error, sends it to the user if necessary
function handleRequestError(friend, e, log, looped, reply) {
    let code = 500; // Default value
    let message = ''; // Default value
    if (e instanceof r.RequestError) {
        code = e.error.code;
    }
    else if (e instanceof r.StatusCodeError) {
        code = e.statusCode;
    }
    if (e instanceof r.StatusCodeError && e.statusCode === 400) {
        message = 'This usually means the API was wrongly implemented either on the current instance or on the friend\'s.';
    }
    else if (e instanceof r.StatusCodeError && e.statusCode === 404) {
        if (reply && !looped)
            return reply(b.notFound());
        else
            return;
    }
    else if (e instanceof r.StatusCodeError && e.statusCode === 500) {
        message = 'This can happen because of a bug in the remote instance\'s code or a bad implentation of the Vinimay API on its side.';
    }
    else if (!(e instanceof r.RequestError)) {
        log.error(e);
        if (reply && !looped)
            return reply(b.wrap(e));
        else
            return;
    }
    // Default behaviour
    if (code)
        log.warn('Got a ' + code + ' when querying ' + friend);
    else
        log.error(e);
    if (message.length)
        log.warn(message);
    if (reply && !looped)
        reply(b.serverUnavailable());
}
exports.handleRequestError = handleRequestError;
