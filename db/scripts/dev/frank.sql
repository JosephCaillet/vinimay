INSERT INTO profile(username, description, url)
VALUES('frank', 'Hello, I''m Frank', 'localhost:3006');

INSERT INTO user(username, url, password, salt)
VALUES('frank', 'localhost:3006', 'hash', 'salt');

--INSERT INTO post VALUES(1493825868497,1493825868497,'Hello friends from Frank :-)','friends');
--INSERT INTO post VALUES(1493825869829,1493825869829,'Hello myself from Frank :-)','private');
--INSERT INTO post VALUES(1493825871133,1493825871133,'Hello world from Frank :-)','public');

--INSERT INTO profile VALUES('alice','localhost:3000',NULL);

--INSERT INTO comment VALUES(1494316277664,1494316277664,'Hey, this is Alice',1493825871133,'alice','localhost:3000');