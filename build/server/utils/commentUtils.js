"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const request = require("request-promise-native");
const commons = require("./commons");
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
        if (url.indexOf('localhost') < 0 && !commons.settings.forceHttp)
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
            timestamp: timestamp,
            content: content,
            author: author.toString()
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
        if (url.indexOf('localhost') < 0 && !commons.settings.forceHttp)
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
function deleteRemoteComment(currentUser, postAuthor, commentAuthor, tsPost, tsComment, idtoken, sigtoken) {
    return new Promise((resolve, reject) => {
        let params = {
            timestamp: tsPost,
            author: commentAuthor,
            commentTimestamp: tsComment
        };
        let reqPath = path.join('/v1/server/posts', tsPost.toString(), 'comments', commentAuthor.toString(), tsComment.toString());
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
        })
            .then((response) => {
            log.debug('Deleted a comment on', postAuthor.toString());
            resolve(response);
        }).catch(reject);
    });
}
exports.deleteRemoteComment = deleteRemoteComment;
