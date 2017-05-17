#!/bin/bash
if [[ $1 = "start" ]]; then
	npm run start:alice &
	npm run start:bob &
	npm run start:frank &

	sleep 4

	alice=$(lsof -i :3000 | tail -1 | tr -s ' ' | cut -d' ' -f2)
	if [ -z "$alice" ]; then
		echo "Alice's server failed to start!"
		exit 1
	fi
	echo "Started Alice's server"
	bob=$(lsof -i :3001 | tail -1 | tr -s ' ' | cut -d' ' -f2)
	if [ -z "$bob" ]; then
		echo "Bob's server failed to start!"
		exit 1
	fi
	echo "Started Bob's server"
	frank=$(lsof -i :3006 | tail -1 | tr -s ' ' | cut -d' ' -f2)
	if [ -z "$frank" ]; then
		echo "Frank's server failed to start!"
		exit 1
	fi
	echo "Started Frank's server"

	echo $alice > alice.pid
	echo $bob > bob.pid
	echo $frank > frank.pid
elif [[ $1 = "stop" ]]; then
	kill $(cat alice.pid)
	echo "Stopped Alice's server"
	
	kill $(cat bob.pid)
	echo "Stopped Bob's server"
	
	kill $(cat frank.pid)
	echo "Stopped Frank's server"
elif [[ $1 = "clean" ]]; then
	rm alice.pid
	rm bob.pid
	rm frank.pid
else
	echo "Error : Valid arguments are start, stop, clean."
fi
