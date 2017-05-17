#!/bin/bash

reset() {
	./starTestInstances.sh stop > /dev/null 2>&1
	./starTestInstances.sh clean > /dev/null 2>&1

	./resetdb.sh
	./starTestInstances.sh start

	# Let the servers start
	sleep 4
}

# Build

echo 'Building'

rm -rf build/server
tsc -p server

if [[ $? -eq 1 ]]; then
	echo 'Build failed'
	exit 1
fi

VINIMAY_ENV=test reset

codes=""

newman run tests/me.json
codes="$codes $?"
newman run tests/posts.json
codes="$codes $?"
newman run tests/comments.json
codes="$codes $?"
newman run tests/reactions.json
codes="$codes $?"

# We need to switch to other SQL scripts, with no friends in them
reset

newman run tests/friends.json
codes="$codes $?"


if [[ $codes == *"1"* ]]; then
	exit 1
else
	exit 0
fi
