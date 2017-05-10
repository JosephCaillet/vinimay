PRAGMA foreign_keys=true;

DROP TABLE IF EXISTS reaction;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS post;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS friend;
DROP TABLE IF EXISTS profile;

CREATE TABLE profile(
	username	TEXT NOT NULL,
	url			TEXT NOT NULL,
	description	TEXT,
	PRIMARY KEY(username, url)
);

CREATE TABLE user(
	username	TEXT NOT NULL,
	url			TEXT NOT NULL,
	password	TEXT NOT NULL,
	salt		TEXT NOT NULL,
	PRIMARY KEY(username, url),
	FOREIGN KEY(username, url) REFERENCES profile(username, url) ON UPDATE CASCADE
);

CREATE TABLE friend(
	username		TEXT NOT NULL,
	url				TEXT NOT NULL,
	id_token		TEXT,
	signature_token	TEXT,
	status			TEXT NOT NULL,
	PRIMARY KEY(username, url),
	FOREIGN KEY(username, url) REFERENCES profile(username, url) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE post(
	creationTs			INTEGER NOT NULL,
	lastModificationTs	INTEGER NOT NULL,
	content				TEXT NOT NULL,
	privacy				TEXT NOT NULL,
	PRIMARY KEY(creationTs)
);

CREATE TABLE comment(
	creationTs			INTEGER NOT NULL,
	lastModificationTs	INTEGER NOT NULL,
	content				TEXT NOT NULL,
	creationTs_Post		INTEGER NOT NULL,
	username			TEXT NOT NULL,
	url					TEXT NOT NULL,
	PRIMARY KEY(creationTs, creationTs_Post),
	FOREIGN KEY(creationTs_Post) REFERENCES post(creationTs) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY(username, url) REFERENCES profile(username, url) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE reaction(
	creationTs			INTEGER NOT NULL,
	username			TEXT NOT NULL,
	url					TEXT NOT NULL,
	PRIMARY KEY(creationTs, username, url),
	FOREIGN KEY(username, url) REFERENCES profile(username, url) ON UPDATE CASCADE ON DELETE CASCADE
);