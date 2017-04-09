--------------------------------------------------------------
--        Script SQLite  
--------------------------------------------------------------


--------------------------------------------------------------
-- Table: Post
--------------------------------------------------------------
CREATE TABLE Post(
	creationTs          INTEGER NOT NULL ,
	lastModificationTs  INTEGER NOT NULL ,
	content             TEXT NOT NULL ,
	privacy             TEXT NOT NULL ,
	username            TEXT ,
	url                 TEXT ,
	PRIMARY KEY (creationTs) ,
	
	FOREIGN KEY (username) REFERENCES Friend(username),
	FOREIGN KEY (url) REFERENCES Friend(url)
);


--------------------------------------------------------------
-- Table: Friend
--------------------------------------------------------------
CREATE TABLE Friend(
	username        TEXT NOT NULL ,
	url             TEXT NOT NULL ,
	description     TEXT ,
	idToken         TEXT ,
	signatureToken  TEXT ,
	status          TEXT ,
	PRIMARY KEY (username,url)
);


--------------------------------------------------------------
-- Table: Comments
--------------------------------------------------------------
CREATE TABLE Comments(
	creationTs          INTEGER NOT NULL ,
	lastModificationTs  INTEGER NOT NULL ,
	content             TEXT NOT NULL ,
	creationTs_Post     INTEGER NOT NULL ,
	username            TEXT ,
	url                 TEXT ,
	PRIMARY KEY (creationTs) ,
	
	FOREIGN KEY (creationTs_Post) REFERENCES Post(creationTs) ON DELETE CASCADE,
	FOREIGN KEY (username) REFERENCES Friend(username) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (url) REFERENCES Friend(url) ON UPDATE CASCADE ON DELETE CASCADE
);


--------------------------------------------------------------
-- Table: User
--------------------------------------------------------------
CREATE TABLE User(
	username     TEXT NOT NULL ,
	description  TEXT NOT NULL ,
	password     TEXT NOT NULL ,
	salt         TEXT NOT NULL ,
	PRIMARY KEY (username)
);


--------------------------------------------------------------
-- Table: Reaction
--------------------------------------------------------------
CREATE TABLE Reaction(
	creationTs  INTEGER NOT NULL ,
	username    TEXT NOT NULL ,
	url         TEXT NOT NULL ,
	PRIMARY KEY (creationTs,username,url) ,
	
	FOREIGN KEY (creationTs) REFERENCES Post(creationTs) ON DELETE CASCADE,
	FOREIGN KEY (username) REFERENCES Friend(username) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (url) REFERENCES Friend(url) ON UPDATE CASCADE ON DELETE CASCADE
);


