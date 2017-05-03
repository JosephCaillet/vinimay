users=$(find db/scripts -name "*.sql" -printf "%f\n" | cut -d. -f1)

for user in $users; do
	rm db/$user.db
	node build/server/scripts/resetdb.js $user
	cat db/scripts/$user.sql | sqlite3 db/$user.db
	echo "Database $user filled"
done