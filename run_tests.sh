#!/bin/bash

# Build

./resetdb.sh

# Let the servers start
sleep 2

# Check if newman is here
which newman > /dev/null 2>&1

codes=""

newman run tests/me.json
codes="$codes $?"
newman run tests/posts.json
codes="$codes $?"

if [[ $codes == *"1"* ]]; then
	exit 1
else
	exit 0
fi
