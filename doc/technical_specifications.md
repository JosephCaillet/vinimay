# Technical specification

Vinimay will use a client-server architecture. This means it'll be made of two components:

* A Node.js server interacting with the SQLite database and managing the data. Its role is to define data models within the application, to process data creation, edition and deletion coming from the client, and retrieving data as requested by the client.
* A client, displaying in the user's web browser, passing to the server all data creation, edition and deletion resulting from the user's actions, and requesting necessary data from the server.

An user action process in Vinimay will be made of the following steps:

* The user makes an action (most of the time this will be a click on a specific element, or a request on a specific URI)
* The client catches the action and translate it into an HTTP request which is sent to the server
* The server receives the request and interact with the database to perform the required process
* The server sends a result (HTTP response with a status code, and a body when required)
* The client receives the response from the server and edits the current display (with content or an informative status box)
* The user gets a feedback on the action's processing

Additionnaly, server-to-server interactions will occur on special occasions, for example on a relationship creation between two users. Both client-server and server-server APIs will be described in this document.

# Client-server API

## Authentication

The authentication will be handled by the Passport framework.

A `POST` on `/client/auth` will result in processing authentication data sent by the client and decide whether or not its credentials are valid. If they are, the server will tell Passport to authenticate the user.

```http
POST /client/auth

{
    "username": "jdoe",
    "password": "h4ckm3"
}
```

## Un-authenticated requests

If an un-authenticated request is sent, what happens depends on the request:

* If the request is about retrieving data, only public content is sent
* If the request is about creating, updating or deleting data, a `401 Unauthorized` HTTP error is sent and the request isn't processed further

## Posts

In all responses shown below, a post will be depicted as such:

```http
{
    "creationTs": 1483484400,
    "lastEditTs": 1483484400,
    "author": "jdoe@example.com",
    "content": "Hello world",
    "privacy": "public",
    "comments": 4,
    "reactions": 20
}
```

The first two fields are the creation date and the last edition date, as a timestamp. If the post was never edited, the last edition date will be the same as the creation date.

Other fields are the post's author (formatted as `username@instanceUrl`), content and privacy setting. The latest has three possible values:

* `public`: Everyone with an application using Vinimay's API can see the post and interact with it
* `friends`: Only the server's owner's friends can see the post and interact with it
* `private`: Only the server's owner can see the post and interact with it

Finally, the two last fields indicate how much comments and reactions have been created for this post.

### Creation

#### Request

A post is created with a `POST` request on `/client/posts` as such:

```http
POST /client/posts

{
    "content": "Hello world!",
    "privacy": "public"
}
```

Post creation is allowed only from the server's owner.

#### Response

If the post's creation was successful, the server will send the following response:

```http
201 Created

[{
    "creationTs": 1483484400,
    "lastEditTs": 1483484400,
    "author": "jdoe@example.com",
    "content": "Hello world",
    "privacy": "public"
    "comments": 0,
    "reactions": 0
}]
```

The object sent in this response describes the post created. The format is described below.

### Retrieval

#### Retrieve several posts

#### Request

Retrieving a range of posts can be done using a `GET` request on `/client/posts`, using request parameters to define the range:

```http
GET /client/posts?start=20&nb=10
```

This request will retrieve 10 posts between the 20th and the 30th most recents posts (10 posts starting from the 20th most recent).

Additionnaly, retrieval of posts can be made using timestamps:

```http
GET /client/posts?from=1483484400&to=1491213194
```

The `to` parameter is optional. If omitted, all posts created after a given timestamp will be sent.

#### Response

If the posts' retrieval was successful, the server will send a response looking like this:

```http
200 OK

[
    {
        "creationTs": 1483484700,
        "lastEditTs": 1483484700,
        "author": "jdoe@example.com",
        "content": "Hello myself",
        "privacy": "private",
        "comments": 1,
        "reactions": 0
    },
    {
        "creationTs": 1483484600,
        "lastEditTs": 1483484600,
        "author": "jdoe@example.com",
        "content": "Hello my friends",
        "privacy": "friends",
        "comments": 5,
        "reactions": 17
    },
    {
        "creationTs": 1483484500,
        "lastEditTs": 1483484500,
        "author": "jdoe@example.com",
        "content": "This is a status",
        "privacy": "public",
        "comments": 2,
        "reactions": 30
    },
    {
        "creationTs": 1483484400,
        "lastEditTs": 1483484400,
        "author": "jdoe@example.com",
        "content": "Hello world",
        "privacy": "public",
        "comments": 6,
        "reactions": 10
    }
]
```

#### Retrieve one post

#### Request

One can retrieve a single post using its creation timestamp and its author's username :

```http
GET /client/posts/[author]/[ts]
```

With `[ts]` being the post's timestamp and `[author]` being its author.

#### Response

If the post's exists, the server will send the following response:

```http
200 OK

[{
    "creationTs": 1483484400,
    "lastEditTs": 1483484400,
    "author": "jdoe@example.com",
    "content": "Hello world",
    "privacy": "public",
    "comments": 4,
    "reactions": 20
}]
```

### Update

#### Request

An update on a post can be made using the post's timestamp ant its author's username, by specifying the fields to update and their new value:

```http
PUT /client/posts/[author]/[ts]

{
    "content": "Hello world!"
}
```

#### Response

The response is similar to the post's creation:

```http
200 OK

[{
    "creationTs": 1483484400,
    "lastEditTs": 1483485400,
    "author": "jdoe@example.com",
    "content": "Hello world",
    "privacy": "public",
    "comments": 4,
    "reactions": 20
}]
```

### Deletion

#### Request

A post's deletion can be made using the post's timestamp and its author's username:

```http
DELETE /client/posts/[author]/[ts]
```

#### Response

The deletion is confirmed with a `204 No Content` response.


## Comments

In all responses shown below, a comment will be depicted as such:

```http
{
    "postAuthor": "fbar@example.com",
    "postTs": 1483484400,
    "creationTs": "1483485400",
    "lastEditTs": "1483485400",
    "author": "jdoe@example.com",
    "content": "Hello world"
}
```

The two first fields are the author and the timestamp of the post the comment has been posted on.

The following two fields are the creation date and the last edition date, as a timestamp. If the comment was never edited, the last edition date will be the same as the creation date.

Other fields are the post's author (formatted as `username@instanceUrl`) and content.

### Retrieval

#### Request

Retrieving a range of comments can be done using the post's timestamp and its author's username, and request parameters to define the range:

```http
GET /client/posts/[author]/[ts]/comments?start=20&nb=10
```

This request will retrieve 10 comments between the 20th and the 30th most recents comments (10 comments starting from the 20th most recent) on a given post.

Additionnaly, retrieval of comments can be made using timestamps:

```http
GET /client/posts/[author]/[ts]/comments?from=1483484400&to=1491213194
```

The `to` parameter is optional. If omitted, all comments created after a given timestamp will be sent.

#### Response

If the comments' retrieval was successful, the server will send a response looking like this:

```http
200 OK

[
    {
        "postAuthor": "fbar@example.com",
        "postTs": 1483484400,
        "creationTs": 1483484700,
        "lastEditTs": 1483484700,
        "author": "jdoe@example.com",
        "content": "Another comment!"
    },
    {
        "postAuthor": "fbar@example.com",
        "postTs": 1483484400,
        "creationTs": 1483484600,
        "lastEditTs": 1483484600,
        "author": "jdoe@example.com",
        "content": "This is a second comment"
    },
    {
        "postAuthor": "fbar@example.com",
        "postTs": 1483484400,
        "creationTs": 1483484500,
        "lastEditTs": 1483484500,
        "author": "jdoe@example.com",
        "content": "This is a comment"
    },
    {
        "postAuthor": "fbar@example.com",
        "postTs": 1483484400,
        "creationTs": "1483485400",
        "lastEditTs": "1483485400",
        "author": "jdoe@example.com",
        "content": "Hello world"
    }
]
```


### Creation

#### Request

A comment is created with a `POST` request as such:

```http
POST /client/posts/[author]/[ts]/comments

{
    "content": "Hello world!"
}
```

Comment creation depends on the post's privacy: friends only for a "public" or "friends"-shared post, and only the server's owner for a "private" post.

#### Response

If the comment's creation was successful, the server will send the following response:

```http
201 Created

[{
    "postAuthor": "fbar@example.com",
    "postTs": 1483484400,
    "creationTs": "1483485400",
    "lastEditTs": "1483485400",
    "author": "jdoe@example.com",
    "content": "Hello world!"
}]
```

The object sent in this response describes the comment created. The format is described below.

### Update

#### Request

An update on a comment can be made using the comment's timestamp, by specifying the new content:

```http
PUT /client/posts/[author]/[postTs]/comments/[comment_ts]

{
    "content": "Hello world!"
}
```

#### Response

The response is similar to the comment's creation:

```http
200 OK

[{
    "postAuthor": "fbar@example.com",
    "postTs": 1483484400,
    "creationTs": 1483484400,
    "lastEditTs": 1483485400,
    "author": "jdoe@example.com",
    "content": "Hello world!"
}]
```

### Deletion

#### Request

A comment's deletion can be made using the comment's timestamp:

```http
DELETE /client/posts/[author]/[postTs]/comments/[comment_ts]
```

#### Response

The deletion is confirmed with a `204 No Content` response.

## Reactions

In all responses shown below, a reaction will be depicted as such:

```http
{
    "postAuthor": "fbar@example.com",
    "postTs": 1483484400,
    "author": "jdoe@example.com"
}
```

The two first fields are the author and the timestamp of the post the reaction has been posted on. The last field is the user (again, formatted as `username@instanceUrl`) the reaction is coming from.

### Creation

#### Request

A reaction is created with a `POST` request as such:

```http
POST /client/posts/[author]/[ts]/reactions
```

Reaction creation depends on the post's privacy: friends only for a "public" or "friends"-shared post, and only the server's owner for a "private" post.

#### Response

If the reaction's creation was successful, the server will send the following response:

```http
201 Created
 
[{
    "postAuthor": "fbar@example.com",
    "postTs": 1483484400,
    "author": "jdoe@example.com"
}]
```

The object sent in this response describes the reaction created. The format is described below.

### Deletion

#### Request

A comment's deletion can be made using the reaction's timestamp:

```http
DELETE /client/posts/[post_author]/[postTs]/reactions/[reaction_author]
```
 
#### Response

The deletion is confirmed with a `204 No Content` response.

### Retrieval

#### Request

Retrieving a range of reactions can be done using the post's timestamp and its author's username, and request parameters to define the range:

```http
GET /client/posts/[author]/[ts]/comments?start=20&nb=10
```

This request will retrieve 10 reactions between the 20th and the 30th most recents reactions (10 comments starting from the 20th most recent) on a given post.

#### Response

If the reactions' retrieval was successful, the server will send a response looking like this:

```http
[
    {
        "postAuthor": "fbar@example.com",
        "postTs": 1483484400,
        "author": "jdoe@example.com"
    },
    {
        "postAuthor": "fbar@example.com",
        "postTs": 1483484400,
        "author": "babolivier@vinimay.example.fr"
    },
    {
        "postAuthor": "fbar@example.com",
        "postTs": 1483484400,
        "author": "jcaillet@example.com"
    }
    {
        "postAuthor": "fbar@example.com",
        "postTs": 1483484400,
        "author": "fbar@example.com"
    }
]
```

## Friend requests

[TODO]

# Server-server API

## Friend requests

This section will rather describe the protocol followed by Vinimay to create a friendly relationship between two server than the API used only, even though it will also be described along the way.

### Sending the request

To clarify all further explanation, in this part, we'll use a scenario in which Alice asks Bob to be her friend (and Bob is OK with that).

When Alice uses here client to send a friend request, the server retrieves the request and send the following request to Bob's server:

```http
POST /server/friends/request

{
    "from": "alice@vinimay-server1.com",
    "to": "bob@vinimay-server2.com"
}
```

*Note: from this moment on, if Bob tries to send a friend request to Alice, her server will reply with a `409	Conflict` HTTP error, telling Bob's server that a request is already ongoing.*

### Replying to the request

