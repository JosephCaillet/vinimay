rm db/alice.db
node build/server/scripts/resetdb.js
cat db/scripts/alice.sql | sqlite3 db/alice.db