#!/bin/bash

if [[ $VINIMAY_ENV = "test" ]]; then
	echo "Detected tests environment"
	dir="tests"
else
	echo "Detected development environment"
	dir="dev"
fi

if [ $# -gt 0 ]; then
	users=$@
else
	users=$(find db/scripts/$dir -name "*.sql" -printf "%f\n" | cut -d. -f1)
fi

for user in $users; do
	if [ -f db/$user.db ]; then
		rm db/$user.db
	fi
	cat db/scripts/initdb.sql | sqlite3 db/$user.db
	echo "Database $user created with structure"
	cat db/scripts/$dir/$user.sql | sqlite3 db/$user.db
	echo "Database $user filled"
done