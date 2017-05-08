INSERT INTO profile(username, description, url)
VALUES('frank', 'Hello, I''m Alice', 'localhost:3006');

INSERT INTO user(username, url, password, salt)
VALUES('frank', 'localhost:3006', 'hash', 'salt');

INSERT INTO post VALUES(1493825868497,1493825868497,'Hello friends from Frank :-)','friends');
INSERT INTO post VALUES(1493825869829,1493825869829,'Hello myself from Frank :-)','private');
INSERT INTO post VALUES(1493825871133,1493825871133,'Hello world from Frank :-)','public');
