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
	PRIMARY KEY (creationTs)
);


--------------------------------------------------------------
-- Table: Profile
--------------------------------------------------------------
CREATE TABLE Profile(
	username     TEXT NOT NULL ,
	url          TEXT NOT NULL ,
	description  TEXT ,
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
	FOREIGN KEY (username) REFERENCES Profile(username) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (url) REFERENCES Profile(url) ON UPDATE CASCADE ON DELETE CASCADE
);


--------------------------------------------------------------
-- Table: User
--------------------------------------------------------------
CREATE TABLE User(
	password  TEXT NOT NULL ,
	salt      TEXT NOT NULL ,
	username  TEXT NOT NULL ,
	url       TEXT NOT NULL ,
	PRIMARY KEY (username,url) ,
	
	FOREIGN KEY (username) REFERENCES Profile(username) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (url) REFERENCES Profile(url) ON UPDATE CASCADE ON DELETE CASCADE
);


--------------------------------------------------------------
-- Table: Friend
--------------------------------------------------------------
CREATE TABLE Friend(
	id_token         TEXT NOT NULL ,
	signature_token  TEXT NOT NULL ,
	status           TEXT NOT NULL ,
	username         TEXT NOT NULL ,
	url              TEXT NOT NULL ,
	PRIMARY KEY (username,url) ,
	
	FOREIGN KEY (username) REFERENCES Profile(username) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (url) REFERENCES Profile(url) ON UPDATE CASCADE ON DELETE CASCADE
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
	FOREIGN KEY (username) REFERENCES Profile(username) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (url) REFERENCES Profile(url) ON UPDATE CASCADE ON DELETE CASCADE
);


