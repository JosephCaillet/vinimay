./resetdb.sh

./starTestInstances.sh start

echo 'Servers started, enter any key to terminate'

read -n1
echo

./starTestInstances.sh stop
./starTestInstances.sh clean

echo 'Bye'
