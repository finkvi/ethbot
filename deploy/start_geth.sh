#!/usr/bin/env bash
echo "Starting geth TestNet Node"
screen -dmS geth_testnet /usr/bin/geth --verbosity 3 --testnet --port 30366  --rpc --rpcaddr "0.0.0.0" --rpcport 8566 --rpccorsdomain "*" --rpcapi "eth,web3"
echo "Starting geth  MainNet Node"
screen -dmS geth_main /usr/bin/geth --port 30365  --rpc --rpcaddr "0.0.0.0" --rpcport 8565 --rpccorsdomain "*" --rpcapi "eth,web3"
echo "List of screen"
screen -ls
echo "For go to session: screen -r [sessiion id]"