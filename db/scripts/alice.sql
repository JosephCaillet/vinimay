INSERT INTO profile(username, description, url)
VALUES('alice', 'Hello, I''m Alice', 'localhost');

INSERT INTO user(username, url, password, salt)
VALUES('alice', 'localhost', 'hash', 'salt');

INSERT INTO profile(username, url, description)
VALUES('bob', 'localhost:3001', 'Hello, I''m Bob');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('bob', 'localhost:3001', 'idtoken', 'sigtoken', 'accepted');
