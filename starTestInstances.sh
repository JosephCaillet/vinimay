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
	kill -9 $(cat alice.pid)
	echo "Stopped Alice's server"
	
	kill -9 $(cat bob.pid)
	echo "Stopped Bob's server"
	
	kill -9 $(cat frank.pid)
	echo "Stopped Frank's server"
elif [[ $1 = "clean" ]]; then
	rm alice.pid
	rm bob.pid
	rm frank.pid
else
	echo "Error : Valid arguments are start, stop, clean."
fi
