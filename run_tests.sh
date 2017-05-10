#!/bin/bash

# Build

rm -rf build
tsc -p server

if [[ $? -eq 1 ]]; then
	echo 'Build failed'
	exit 1
fi

./resetdb.sh
./starTestInstances.sh start

# Let the servers start
sleep 2

# Check if newman is here
which newman > /dev/null 2>&1

codes=""

newman run tests/me.json
codes="$codes $?"
newman run tests/posts.json
codes="$codes $?"

./starTestInstances.sh stop
./starTestInstances.sh clean

if [[ $codes == *"1"* ]];then
	exit 1
else
	exit 0
fi
