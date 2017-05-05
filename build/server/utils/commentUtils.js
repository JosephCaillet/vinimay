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
            user: source.toString(),
            timestamp: timestamp
        };
        let reqPath = path.join('/v1/server/posts', timestamp.toString(), 'comments');
        let url = source + reqPath;
        if (idtoken && sigtoken) {
            params.idToken = idtoken;
            url += '?idToken=' + idtoken;
            url += '&signature=' + utils.computeSignature('GET', url, params, sigtoken);
        }
        // We'll use HTTP only for localhost
        if (url.indexOf('localhost') < 0)
            url = 'https://' + url;
        else
            url = 'http://' + url;
        log.debug('Requesting GET ' + url);
        request.get(url)
            .then((response) => {
            log.debug('Received ' + JSON.parse(response).length + ' comments from ' + source);
            ok(JSON.parse(response));
        }).catch(ko);
    });
}
exports.retrieveRemoteComments = retrieveRemoteComments;
