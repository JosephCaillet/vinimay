INSERT INTO profile(username, description, url)
VALUES('frank', 'Hello, I''m Alice', 'localhost:3006');

INSERT INTO user(username, url, password, salt)
VALUES('frank', 'localhost:3006', 'hash', 'salt');