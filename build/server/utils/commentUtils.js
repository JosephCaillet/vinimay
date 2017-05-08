"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const request = require("request-promise-native");
const utils = require("./serverUtils");
const log = require('printit')({
    date: true,
    prefix: 'comments utils'
});
function retrieveRemoteComments(source, timestamp, params, idtoken, sigtoken) {
    return new Promise((ok, ko) => {
        let params = {
            timestamp: timestamp
        };
        let reqPath = path.join('/v1/server/posts', timestamp.toString(), 'comments');
        let url = source + reqPath;
        if (idtoken && sigtoken) {
            params.idToken = idtoken;
            let signature = utils.computeSignature('GET', url, params, sigtoken);
            url += '?idToken=' + idtoken;
            url += '&signature=' + signature;
        }
        // We'll use HTTP only for localhost
        if (url.indexOf('localhost') < 0)
            url = 'https://' + url;
        else
            url = 'http://' + url;
        log.debug('Requesting GET ' + url);
        request.get(url, { json: true })
            .then((response) => {
            log.debug('Received ' + response.length + ' comments from ' + source);
            ok(response);
        }).catch(ko);
    });
}
exports.retrieveRemoteComments = retrieveRemoteComments;
function createRemoteComment(author, user, timestamp, content, idtoken, sigtoken) {
    return new Promise((ok, ko) => {
        let params = {
            timestamp: parseInt(timestamp),
            content: content,
            author: author.toString(),
        };
        let reqPath = path.join('/v1/server/posts', timestamp.toString(), 'comments');
        let url = user + reqPath;
        if (idtoken && sigtoken) {
            params.idToken = idtoken;
            let signature = utils.computeSignature('POST', url, params, sigtoken);
            url += '?idToken=' + idtoken;
            url += '&signature=' + signature;
        }
        // We'll use HTTP only for localhost
        if (url.indexOf('localhost') < 0)
            url = 'https://' + url;
        else
            url = 'http://' + url;
        log.debug('Requesting POST', url);
        let body = {
            author: author.toString(),
            content: content
        };
        request({
            method: 'POST',
            uri: url,
            headers: { 'Content-Type': 'application/json' },
            body: body,
            json: true
        })
            .then((response) => {
            log.debug('Created a comment on', user.toString());
            ok(response);
        }).catch(ko);
    });
}
exports.createRemoteComment = createRemoteComment;
