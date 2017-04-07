rm *.db > /dev/null 2>&1

users=$(find scripts -name "*.sql" -printf "%f\n" | cut -d. -f1)

for i in $users; do
	cat ../doc/db/createDB.sql | sqlite3 $i.db
	cat scripts/$i.sql | sqlite3 $i.db
done
