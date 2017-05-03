INSERT INTO profile(username, description, url)
VALUES('alice', 'Hello, I''m Alice', 'localhost:3000');

INSERT INTO user(username, url, password, salt)
VALUES('alice', 'localhost:3000', 'hash', 'salt');

INSERT INTO profile(username, url, description)
VALUES('bob', 'localhost:3001', 'Hello, I''m Bob');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('bob', 'localhost:3001', 'idtoken', 'sigtoken', 'accepted');

INSERT INTO profile(username, url, description)
VALUES('david', 'localhost:3003', 'Hello, I''m David');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('david', 'localhost:3003', 'idtoken3', 'sigtoken3', 'pending');

INSERT INTO profile(username, url, description)
VALUES('eric', 'localhost:3004', 'Hello, I''m Eric');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('eric', 'localhost:3004', 'idtoken4', 'sigtoken4', 'declined');

INSERT INTO profile(username, url, description)
VALUES('francis', 'localhost:3005', 'Hello, I''m Francis');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('francis', 'localhost:3005', 'idtoken5', 'sigtoken5', 'incoming');

INSERT INTO profile(username, url, description)
VALUES('frank', 'localhost:3006', 'Hello, I''m Frank');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('frank', 'localhost:3006', NULL, NULL, 'following');

--export enum Status {pending, declined, incoming, accepted, following}
