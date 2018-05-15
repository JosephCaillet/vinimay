#!/bin/bash

users=0

for arg in $@; do
	if [[ $arg == "--test" ]]; then
		echo "Detected tests environment"
		dir="tests"
	else
		args="$args $arg"
		((users++))
	fi
done

if [[ $dir != "tests" ]]; then
	echo "Detected development environment"
	dir="dev"
fi

if [ $users -gt 0 ]; then
	db=$args
else
	db=$(find db/scripts/$dir -name "*.sql" -printf "%f\n" | cut -d. -f1)
fi

for user in $db; do
	if [ -f db/$user.db ]; then
		rm db/$user.db
	fi
	cat db/scripts/initdb.sql | sqlite3 db/$user.db
	echo "Database $user created with structure"
	cat db/scripts/$dir/$user.sql | sqlite3 db/$user.db
	echo "Database $user filled"
done