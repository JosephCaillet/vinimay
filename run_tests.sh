#!/bin/bash

# Build

echo 'Building'

rm -rf build/server
tsc -p server

if [[ $? -eq 1 ]]; then
	echo 'Build failed'
	exit 1
fi

VINIMAY_ENV=test ./resetdb.sh
./starTestInstances.sh start

# Let the servers start
sleep 4

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
# So we need to restart the servers with newly-generated databases
./starTestInstances.sh stop
./starTestInstances.sh clean

./resetdb.sh
./starTestInstances.sh start

# Let the servers start
sleep 4

newman run tests/friends.json
codes="$codes $?"

./starTestInstances.sh stop
./starTestInstances.sh clean

if [[ $codes == *"1"* ]]; then
	exit 1
else
	exit 0
fi
