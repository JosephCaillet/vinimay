#------------------------------------------------------------
#        Script SQLite  
#------------------------------------------------------------


#------------------------------------------------------------
# Table: Post
#------------------------------------------------------------
CREATE TABLE Post(
	publication_date        INTEGER NOT NULL ,
	last_modification_date  INTEGER NOT NULL ,
	content                 TEXT NOT NULL ,
	privacy                 TEXT NOT NULL ,
	user_name               TEXT ,
	url                     TEXT ,
	PRIMARY KEY (publication_date) ,
	
	FOREIGN KEY (user_name) REFERENCES Profile(user_name),
	FOREIGN KEY (url) REFERENCES Profile(url)
);


#------------------------------------------------------------
# Table: Profile
#------------------------------------------------------------
CREATE TABLE Profile(
	user_name        TEXT NOT NULL ,
	url              TEXT NOT NULL ,
	description      TEXT ,
	id_token         TEXT ,
	signature_token  TEXT ,
	PRIMARY KEY (user_name,url)
);


#------------------------------------------------------------
# Table: Comments
#------------------------------------------------------------
CREATE TABLE Comments(
	publication_date        INTEGER NOT NULL ,
	last_modification_date  INTEGER NOT NULL ,
	content                 TEXT NOT NULL ,
	publication_date_Post   INTEGER NOT NULL ,
	user_name               TEXT ,
	url                     TEXT ,
	PRIMARY KEY (publication_date) ,
	
	FOREIGN KEY (publication_date_Post) REFERENCES Post(publication_date),
	FOREIGN KEY (user_name) REFERENCES Profile(user_name),
	FOREIGN KEY (url) REFERENCES Profile(url)
);


#------------------------------------------------------------
# Table: Reaction
#------------------------------------------------------------
CREATE TABLE Reaction(
	publication_date  INTEGER NOT NULL ,
	user_name         TEXT NOT NULL ,
	url               TEXT NOT NULL ,
	PRIMARY KEY (publication_date,user_name,url) ,
	
	FOREIGN KEY (publication_date) REFERENCES Post(publication_date),
	FOREIGN KEY (user_name) REFERENCES Profile(user_name),
	FOREIGN KEY (url) REFERENCES Profile(url)
);


