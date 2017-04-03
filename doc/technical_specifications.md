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
    "creation_ts": "1483484400",
    "last_edit_ts": "1483484400",
    "author": "jdoe@example.com",
    "content": "Hello world",
    "privacy": "public"
}
```

The first two fields are the creation date and the last edition date, as a timestamp. If the post was never edited, the last edition date will be the same as the creation date.

Other fields are the post's author (formatted as `username@instance_url`), content and privacy setting. The last one has three possible values:

* `public`: Everyone with an application using Vinimay's API can see the post and interact with it
* `friends`: Only the server's owner's friends can see the post and interact with it
* `private`: Only the server's owner can see the post and interact with it

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
    "creation_ts": 1483484400,
    "last_edit_ts": 1483484400,
    "author": "jdoe@example.com",
    "content": "Hello world",
    "privacy": "public"
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


```http
GET /client/posts?from=1483484400&to=1491213194
```

The `to` parameter is optional. If omitted, all posts since a given timestamp will be sent.

#### Response

If the posts' retrieval was successful, the server will send a response looking like this:

```http
200 OK

[
    {
        "creation_ts": 1483484700,
        "last_edit_ts": 1483484700,
        "author": "jdoe@example.com",
        "content": "Hello myself",
        "privacy": "private"
    },
    {
        "creation_ts": 1483484600,
        "last_edit_ts": 1483484600,
        "author": "jdoe@example.com",
        "content": "Hello my friends",
        "privacy": "friends"
    },
    {
        "creation_ts": 1483484500,
        "last_edit_ts": 1483484500,
        "author": "jdoe@example.com",
        "content": "This is a status",
        "privacy": "public"
    },
    {
        "creation_ts": 1483484400,
        "last_edit_ts": 1483484400,
        "author": "jdoe@example.com",
        "content": "Hello world",
        "privacy": "public"
    }
]
```

#### Retrieve one post

#### Request

One can retrieve a single post using its creation timestamp and its author's username :

```http
GET /client/posts/[username]/[ts]
```

With `[ts]` being the post's timestamp and `[username]` being its author.

#### Response

If the post's exists, the server will send the following response:

```http
200 OK

[{
    "creation_ts": 1483484400,
    "last_edit_ts": 1483484400,
    "author": "jdoe@example.com",
    "content": "Hello world",
    "privacy": "public"
}]
```

### Update

#### Request

An update on a post can be made using the post's timestamp ant its author's username, by specifying the fields to update and their new value:

```http
PUT /client/posts/[username]/[ts]

{
    "content": "Hello world!"
}
```

#### Response

The response is similar to the post's creation:

```http
200 OK

[{
    "creation_ts": 1483484400,
    "last_edit_ts": 1483485400,
    "author": "jdoe@example.com",
    "content": "Hello world",
    "privacy": "public"
}]
```

### Deletion

#### Request

A post's deletion can be made using the post's timestamp and its author's username:

```http
DELETE /client/posts/[username]/[ts]
```

#### Response

The deletion is confirmed with a `204 No Content` response.


## Comments

In all responses shown below, a comment will be depicted as such:

```http
{
    "post_autor": "fbar@example.com",
    "post_ts": "1483484400",
    "creation_ts": "1483485400",
    "last_edit_ts": "1483485400",
    "author": "jdoe@example.com",
    "content": "Hello world"
}
```

The first field is the timestamp of the post the comment has been posted on.

The following two fields are the creation date and the last edition date, as a timestamp. If the comment was never edited, the last edition date will be the same as the creation date.

Other fields are the post's author (formatted as `username@instance_url`) and content.

### Retrieval

#### Request

Retrieving a range of posts can be done using the post's timestamp and its author's username, and request parameters to define the range:

```http
GET /client/posts/[username]/[ts]/comments?start=20&nb=10
```

This request will retrieve 10 posts between the 20th and the 30th most recents posts (10 posts starting from the 20th most recent).

```http
GET /client/posts/[username]/[ts]/comments?from=1483484400&to=1491213194
```

The `to` parameter is optional. If omitted, all comments since a given timestamp will be sent.

#### Response

If the posts' retrieval was successful, the server will send a response looking like this:

```http
200 OK

[
    {
        "post_autor": "fbar@example.com",
        "creation_ts": 1483484700,
        "last_edit_ts": 1483484700,
        "author": "jdoe@example.com",
        "content": "Hello myself",
        "privacy": "private"
    },
    {
        "post_autor": "fbar@example.com",
        "creation_ts": 1483484600,
        "last_edit_ts": 1483484600,
        "author": "jdoe@example.com",
        "content": "Hello my friends",
        "privacy": "friends"
    },
    {
        "post_autor": "fbar@example.com",
        "post_ts": "1483484400",
        "creation_ts": 1483484500,
        "last_edit_ts": 1483484500,
        "author": "jdoe@example.com",
        "content": "Hello world"
    },
    {
        "post_autor": "fbar@example.com",
        "post_ts": "1483484400",
        "creation_ts": "1483485400",
        "last_edit_ts": "1483485400",
        "author": "jdoe@example.com",
        "content": "Hello world"
    }
]
```


### Creation

#### Request

A comment is created with a `POST` request as such:

```http
POST /client/posts/[username]/[ts]/comments

{
    "content": "Hello world!"
}
```

Comment creation depends on the post's privacy: Everyone for a "public" post, friends only for a "friends"-shared post, and only the server's owner for a "private" post.

#### Response

If the comment's creation was successful, the server will send the following response:

```http
201 Created

[{
    "post_autor": "fbar@example.com",
    "post_ts": "1483484400",
    "creation_ts": "1483485400",
    "last_edit_ts": "1483485400",
    "author": "jdoe@example.com",
    "content": "Hello world!"
}]
```

The object sent in this response describes the post created. The format is described below.

### Update

#### Request

An update on a comment can be made using the comment's timestamp, by specifying the new content:

```http
PUT /client/posts/[username]/[post_ts]/comments/[comment_ts]

{
    "content": "Hello world!"
}
```

#### Response

The response is similar to the comment's creation:

```http
200 OK

[{
    "post_autor": "fbar@example.com",
    "post_ts": "1483484400",
    "creation_ts": 1483484400,
    "last_edit_ts": 1483485400,
    "author": "jdoe@example.com",
    "content": "Hello world!"
}]
```

### Deletion

#### Request

A comment's deletion can be made using the comment's timestamp:

```http
DELETE /client/posts/[username]/[post_ts]/comments/[comment_ts]
```

#### Response

The deletion is confirmed with a `204 No Content` response.
