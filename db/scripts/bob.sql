INSERT INTO profile(username, description, url)
VALUES('bob', 'Hello, I''m Bob', 'localhost');

INSERT INTO user(username, url, password, salt)
VALUES('bob', 'localhost', 'hash', 'salt');

INSERT INTO profile(username, url, description)
VALUES('alice', 'localhost:3001', 'Hello, I''m Alice');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('alice', 'localhost:3001', 'idtoken', 'sigtoken', 'friends');
