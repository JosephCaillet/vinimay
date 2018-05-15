"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Friend {
    constructor(user, description) {
        this.user = user;
        this.description = description;
    }
}
exports.Friend = Friend;
class OutgoingRequests {
    constructor(user, status) {
        this.user = user;
        this.status = status;
    }
}
exports.OutgoingRequests = OutgoingRequests;
class Response {
    constructor() {
        this.accepted = new Array();
        this.incoming = new Array();
        this.sent = new Array();
        this.following = new Array();
    }
    addAccepted(friend) {
        this.accepted.push(friend);
    }
    addIncoming(friend) {
        this.incoming.push(friend);
    }
    addSent(friend) {
        this.sent.push(friend);
    }
    addFollowing(friend) {
        this.following.push(friend);
    }
}
exports.Response = Response;
var Status;
(function (Status) {
    Status[Status["pending"] = 0] = "pending";
    Status[Status["declined"] = 1] = "declined";
    Status[Status["incoming"] = 2] = "incoming";
    Status[Status["accepted"] = 3] = "accepted";
    Status[Status["following"] = 4] = "following";
})(Status = exports.Status || (exports.Status = {}));
