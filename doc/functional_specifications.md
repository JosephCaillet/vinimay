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

- **A post**:
	- is a textual content, with a publication date
	- has a privacy setting (is the post shared with only me, only my friends, or is it public?)