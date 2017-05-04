INSERT INTO profile(username, description, url)
VALUES('bob', 'Hello, I''m Bob', 'localhost:3001');

INSERT INTO user(username, url, password, salt)
VALUES('bob', 'localhost:3001', 'hash', 'salt');

INSERT INTO profile(username, url, description)
VALUES('alice', 'localhost:3000', 'Hello, I''m Alice');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('alice', 'localhost:3000', 'idtoken', 'sigtoken', 'accepted');

INSERT INTO post VALUES(1493825859215,1493825859215,'Hello Alice :-)','friends');
INSERT INTO post VALUES(1493825860663,1493825860663,'Hello myself :-)','private');
INSERT INTO post VALUES(1493825862231,1493825862231,'Hello world :-)','public');
INSERT INTO post VALUES(1493825863396,1493825863396,'Hello Alice :-)','friends');
INSERT INTO post VALUES(1493825865500,1493825865500,'Hello myself :-)','private');
INSERT INTO post VALUES(1493825867099,1493825867099,'Hello world :-)','public');
