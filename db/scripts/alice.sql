INSERT INTO profile(username, description, url)
VALUES('alice', 'Hello, I''m Alice', 'localhost');

INSERT INTO user(username, url, password, salt)
VALUES('alice', 'localhost', 'hash', 'salt');

INSERT INTO profile(username, url, description)
VALUES('bob', 'localhost:3001', 'Hello, I''m Bob');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('bob', 'localhost:3001', 'idtoken', 'sigtoken', 'accepted');

INSERT INTO profile(username, url, description)
VALUES('caroline', 'localhost:3002', 'Hello, I''m Caroline');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('caroline', 'localhost:3002', 'idtoken', 'sigtoken', 'accepted');

INSERT INTO profile(username, url, description)
VALUES('david', 'localhost:3003', 'Hello, I''m David');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('david', 'localhost:3003', 'idtoken', 'sigtoken', 'pending');

INSERT INTO profile(username, url, description)
VALUES('eric', 'localhost:3004', 'Hello, I''m Eric');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('eric', 'localhost:3004', 'idtoken', 'sigtoken', 'declined');

INSERT INTO profile(username, url, description)
VALUES('francis', 'localhost:3005', 'Hello, I''m Francis');

INSERT INTO friend(username, url, id_token, signature_token, status)
VALUES('francis', 'localhost:3005', 'idtoken', 'sigtoken', 'incoming');

--export enum Status {pending, declined, incoming, accepted, following}
