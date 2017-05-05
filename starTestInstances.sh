#!/bin/bash
if [[ $1 = "start" ]]; then
	echo "Starting Alice's server..."
	npm run start:alice &
	echo $! > alice.pid
	
	echo "Starting Bob's server..."
	npm run start:bob &
	echo $! > bob.pid
	
	echo "Starting Frank's server..."
	npm run start:frank &
	echo $! > frank.pid
elif [[ $1 = "stop" ]]; then
	echo "Stopping Alice's server..."
	kill $(cat alice.pid)
	
	echo "Stopping Bob's server..."
	kill $(cat bob.pid)
	
	echo "Stopping Frank's server..."
	kill $(cat frank.pid)
elif [[ $1 = "clean" ]]; then
	rm alice.pid
	rm bob.pid
	rm franck.pid
else
	echo "Error : Valid arguments are start, stop, clean."
fi
