# Functional specifications

## Functional analysis

- **Who does the system target?** The social networks users.
- **What does the system affect?** The way users' online interactions are handled.
- **In what goal?** Allow users to interact with one another in a way that respects their privacy.

## Function and constraints

- **Main function**: Allowing two or more users to exchange via social interactions (*posts* publication, reaction to other's statuses, instant messaging...).
- **Constraint #1**: Decentralised: The system must work using user-owned servers which must be able to request one another without the need for a central server.
- **Constraint #2**: Privacy by design: The system must respect the user's privacy, and must allow them to select the content shared with others.
- **Constraint #3**: Free software: In order to fully fulfill constraint #2, the system must be powered by free software.
- **Constraint #4**: The system must be able to easily export the user's data in order to migrate from one instance of the system to another.
- **Constraint #5**: Ergonomy: The system must provide an ergonomic and easy to use graphic interface.
- **Constraint #6**: Performance: The system must be able to run on small material configurations (ex: Raspberry Pi).

## Features

### Post

A post is a **textual content** published by an **author**. It has a **publication date**, a **last modification date**, a **privacy setting** (is the post shared with only me, only my friends, or is it public?),and **reactions** to it by other users.

A post can be :
- **Created**: The post is created by an author, with the current date as its publication date, and a privacy setting chosen by the user. Its content is also set by the user.
- **Read**: Depending of the post's privacy setting (or the user is the post's author), an user can display all data related to a post.
- **Update**: The post's content and/or privacy setting are set to different values by the user. The last edition date is set to current date.
- **Deleted**: All data related to the post (publication date, privacy setting, content, reactions and comments) is removed.
- **Commented**: see [comments section](#comments).

### Comments

A comment is a **text**, in reaction to a **post**. It has an **author**, a **publication date**, a **last modification date** and is related to a post.

A comment can be:
- **Created**: The comment is created by an author, linked to a post, with the current date as publication date, an empty last modification date, a text as content.
- **Read**: The comment can be read by anyone having read access on the post it refers to.
- **Updated**: The comment's content can be updated, and the last modification date is set to current date.
- **Deleted**: Both the post's and the comment's authors can delete a comment.

### 