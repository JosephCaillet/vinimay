./resetdb.sh

./starTestInstances.sh start

if [ $? -ne 0 ]; then
	echo "One server or more failed to start, aborting"
	exit 1
fi

echo "Servers started, enter any key to terminate"

read -n1
echo

./starTestInstances.sh stop
./starTestInstances.sh clean

echo "Bye"
