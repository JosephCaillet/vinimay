#------------------------------------------------------------
#        Script SQLite  
#------------------------------------------------------------


#------------------------------------------------------------
# Table: Post
#------------------------------------------------------------
CREATE TABLE Post(
	creationTs          INTEGER NOT NULL ,
	lastModificationTs  INTEGER NOT NULL ,
	content             TEXT NOT NULL ,
	privacy             TEXT NOT NULL ,
	username            TEXT ,
	url                 TEXT ,
	PRIMARY KEY (creationTs) ,
	
	FOREIGN KEY (username) REFERENCES Profile(username),
	FOREIGN KEY (url) REFERENCES Profile(url)
);


#------------------------------------------------------------
# Table: Profile
#------------------------------------------------------------
CREATE TABLE Profile(
	username        TEXT NOT NULL ,
	url             TEXT NOT NULL ,
	description     TEXT ,
	idToken         TEXT ,
	signatureToken  TEXT ,
	PRIMARY KEY (username,url)
);


#------------------------------------------------------------
# Table: Comments
#------------------------------------------------------------
CREATE TABLE Comments(
	creationTs          INTEGER NOT NULL ,
	lastModificationTs  INTEGER NOT NULL ,
	content             TEXT NOT NULL ,
	creationTs_Post     INTEGER NOT NULL ,
	username            TEXT ,
	url                 TEXT ,
	PRIMARY KEY (creationTs) ,
	
	FOREIGN KEY (creationTs_Post) REFERENCES Post(creationTs),
	FOREIGN KEY (username) REFERENCES Profile(username),
	FOREIGN KEY (url) REFERENCES Profile(url)
);


#------------------------------------------------------------
# Table: Reaction
#------------------------------------------------------------
CREATE TABLE Reaction(
	creationTs  INTEGER NOT NULL ,
	username    TEXT NOT NULL ,
	url         TEXT NOT NULL ,
	PRIMARY KEY (creationTs,username,url) ,
	
	FOREIGN KEY (creationTs) REFERENCES Post(creationTs),
	FOREIGN KEY (username) REFERENCES Profile(username),
	FOREIGN KEY (url) REFERENCES Profile(url)
);


