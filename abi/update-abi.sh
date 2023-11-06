git clone https://github.com/matter-labs/era-contracts.git
pushd era-contracts/ethereum
yarn install

solc --base-path contracts \
  --include-path node_modules/  \
  --abi \
  -o bridgehub-abi \
  contracts/bridgehub/bridgehub-interfaces/IBridgehub.sol


solc --base-path contracts \
  --include-path node_modules/  \
  --abi \
  -o bridge-abi \
  contracts/bridge/interfaces/IL1Bridge.sol \
  contracts/bridge/interfaces/IL2Bridge