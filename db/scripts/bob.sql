INSERT INTO profile(username, description, url)
VALUES('bob', 'Hello, I''m Bob', 'localhost');

INSERT INTO user(username, url, password, salt)
VALUES('bob', 'localhost:3001', 'hash', 'salt');

INSERT INTO profile(username, url, description)
VALUES('alice', 'localhost:3000', 'Hello, I''m Alice');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('alice', 'localhost:3000', 'idtoken', 'sigtoken', 'accepted');
