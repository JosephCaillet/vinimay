"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const request = require("request-promise-native");
const commons = require("./commons");
const utils = require("./serverUtils");
const log = require('printit')({
    date: true,
    prefix: 'Utils:Reactions'
});
function createRemoteReaction(author, user, timestamp, idtoken, sigtoken) {
    return new Promise((ok, ko) => {
        let params = {
            timestamp: timestamp,
            author: author.toString()
        };
        let reqPath = path.join('/v1/server/posts', timestamp.toString(), 'reactions');
        let url = user + reqPath;
        if (idtoken && sigtoken) {
            params.idToken = idtoken;
            let signature = utils.computeSignature('POST', url, params, sigtoken);
            url += '?idToken=' + idtoken;
            url += '&signature=' + signature;
        }
        // We'll use HTTP only for localhost
        if (url.indexOf('localhost') < 0 && !commons.settings.forceHttp)
            url = 'https://' + url;
        else
            url = 'http://' + url;
        log.debug('Requesting POST', url);
        let body = {
            author: author.toString()
        };
        request({
            method: 'POST',
            uri: url,
            headers: { 'Content-Type': 'application/json' },
            body: body,
            json: true,
            timeout: commons.settings.timeout
        })
            .then((response) => {
            log.debug('Created a reaction on', user.toString());
            ok(response);
        }).catch(ko);
    });
}
exports.createRemoteReaction = createRemoteReaction;
function deleteRemoteReaction(postAuthor, tsPost, reactionAuthor, idtoken, sigtoken) {
    return new Promise((resolve, reject) => {
        let params = {
            timestamp: tsPost,
            author: reactionAuthor.toString()
        };
        let reqPath = path.join('/v1/server/posts', tsPost.toString(), 'reactions');
        let url = postAuthor + reqPath;
        if (idtoken && sigtoken) {
            params.idToken = idtoken;
            let signature = utils.computeSignature('DELETE', url, params, sigtoken);
            url += '?idToken=' + idtoken;
            url += '&signature=' + signature;
        }
        // We'll use HTTP only for localhost
        if (url.indexOf('localhost') < 0 && !commons.settings.forceHttp)
            url = 'https://' + url;
        else
            url = 'http://' + url;
        log.debug('Requesting DELETE', url);
        request({
            method: 'DELETE',
            uri: url,
            headers: { 'Content-Type': 'application/json' },
            body: {
                author: reactionAuthor.toString()
            },
            json: true,
            timeout: commons.settings.timeout
        })
            .then((response) => {
            log.debug('Deleted a reaction on', postAuthor.toString());
            resolve(response);
        }).catch(reject);
    });
}
exports.deleteRemoteReaction = deleteRemoteReaction;
