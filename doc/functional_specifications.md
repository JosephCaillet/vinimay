# Functional specifications

## Functional analysis

- **Who does the system target?** The social networks users.
- **What does the system affect?** The way users' online interactions are handled.
- **In what goal?** Allow users to interact with one another in a way that respects their privacy.

## Function and constraints

- **Main function**: Allowing two or more users to exchange via social interactions (connect with other users, publish posts, react to other's posts...).
- **Constraint #1**: Decentralised: The system must work using user-owned servers which must be able to request one another without the need for a central server.
- **Constraint #2**: Privacy by design: The system must respect the user's privacy, and must allow them to select the content shared with others.
- **Constraint #3**: Free software: In order to fully fulfill constraint #2, the system must be powered by free software (as defined by the Free Software Foundation) and placed under the AGPL v3 license.
- **Constraint #4**: Migration: The system must be able to easily export the user's data in order to migrate from one instance of the system to another.
- **Constraint #5**: Ergonomy: The system must provide an ergonomic and easy to use graphic interface.
- **Constraint #6**: Performance: The system must be able to run on small material configurations (ex: Raspberry Pi).
- **Constraint #7**: Data ownership: The user has full ownership and control over the data it produces.
- **Constraint #8**: Security: The system must ensure that each communication comes from the source it pretends.

## Features

### Post

A post is a **textual content** published by an **author**. It has a **publication date**, a **last modification date**, a **privacy setting** (is the post shared with only me, only my friends, or is it public?), and **reactions** to it by other users.

A post can be :
- **Created**: The post is created by an author, with the current date as its publication date, and a privacy setting chosen by the user. Its content is also set by the user.
- **Read**: Depending on the post's privacy setting (or if the user is the post's author), an user can display all data related to a post.
- **Update**: The post's content and/or privacy setting are set to different values by the user. The last edition date is set to current date.
- **Deleted**: All data related to the post (publication date, privacy setting, content, reactions and comments) is removed.
- **Commented**: See [comments section](#comments).

### Comment

A comment is a **text**, is linked to a **post**. It has an **author**, a **publication date** and a **last modification date**.

A comment can be:
- **Created**: The comment is created by an author, linked to a post, with the current date as its publication date and a textual content set by the user.
- **Read**: The comment can be read by anyone having read access on the post it links to.
- **Updated**: The comment's content can be updated, and the last modification date is set to current date.
- **Deleted**: Both the post's and the comment's authors can delete a comment.

### Reaction

Reactions are **interactions** with a post wich content **don't rely on a media** (text, or any other media that might be supported by the system as comments in the future), and coming with a **positive connotation** (liking a content, supporting an action, etc). It is a feature similar to Facebook's like or Twitter's favorite (now also renamed "like").

A reaction can be:
- **Added to a post**: An user can add a reaction to a friend's post or to one of its own. An user can only add one reaction per post.
- **Removed from a post**: An user can remove a reaction it added on a friend's post or one of its own.

### Friendship

Friendship describes the relationship between two users as described in the [section below](#friend). It works based on **requests**: Alice sends a friend request to Bob's server, Bob accepts the request, then both are each other's **friend** and can interact with posts the other share with its friends.

A friend request can be:
- **Sent**: Alice can send Bob a friend request
- **Accepted**: Bob can accept Alice's request
- **Refused**: Bob can refuse Alice's request
- **Canceled**: Alice can cancel her friend request to Bob

Once a friend request is accepted, both servers save data (**the user's displayed name**, **the server's address**, **tokens to use in further communications**) about the other to ensure the next communications will happen within the "Friend" relationship.

### Relationship

Relationships define the way a content can be interacted with according to privacy rules. It can be categorised in three types:

#### Server owner

Servers are user-owned, which means that each server should represent an unique user. This means that the server owner has full read and write access over the content (posts, comments, etc) stored on it.

In other terms, it means that the user has control over its own data, as they can:

- Create a post
- Read, update or delete their own posts
- Create, read or delete a comment on their own posts
- Update their own comments

#### Friend

A friend is an user that has been authorised to access a content published by another server's owner, according to privacy rules. A practical example is that, if Alice creates a post and shares it with her friends (by setting the privacy rule in order to do so), and if Bob is a friend of Alice, Bob will see Alice's post.

A friend can:

- Read posts shared with a friend's friends
- Comment on posts shared with a friend's friends
- Update or delete their own comments

#### The rest of the world

The rest of the world includes everyone that isn't already included in the "Server owner" or "Friend" relationships.

The rest of the world can:

- Read posts shared with the rest of the world
- Read comments linked to posts shared with the rest of the world