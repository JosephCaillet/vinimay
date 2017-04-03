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

A post is created with a `POST` request on `/posts` as such:

```http
POST /client/posts

{
    "content": "Hello world!",
    "privacy": "public",
    "signature": "foobar"
}
```

Post creation is allowed only from the server's owner.

##### Response

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

If the creation fails, the server will send an error response as detailled in the section relative to errors below.

### Retrieval

#### Retrieve several posts

Retrieving a range of posts can be done using a `GET` request on `/posts`, using request parameters to define the range:

```http
GET /client/posts?start=1483484400&stop=1491213194
```

The `stop` parameter is optional. If omitted, all posts since a given timestamp will be sent.


Additionnaly, one can retrieve the n latests posts using the `nb` parameter:

```http
GET /client/posts?nb=20
```

If the client isn't authenticated, only public posts in this range will be included in the response.

#### Response

If the posts' retrieval was successful, the server will send a response looking like this:

```http
200 OK

{
    "length": 4,
    "statuses": [
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
}
```

The `length` attribute is the number of statuses sent.

#### Retrieve one post

One can retrieve a single post using its creation timestamp:

```http
GET /client/posts/[ts]
```

With `[ts]` being the post's timestamp.

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

An update on a post can be made using the post's timestamp, by specifying the fields to update and their new value:

```http
PUT /client/posts/[ts]

{
    "content": "Hello world!",
    "signature": "foobar"
}
```

#### Response

The response is similar to the post's creation:

```http
200 OK

[{
    "creation_ts": 1483484400,
    "last_edit_ts": 1483484400,
    "author": "jdoe@example.com"
    "content": "Hello world",
    "privacy": "public"
}]
```

### Deletion

A post's deletion can be made using the post's timestamp:

```http
DELETE /client/posts/[ts]
```

#### Response

The deletion is confirmed with a `204 No Content` response.