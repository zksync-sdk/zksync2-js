# 🚀 zksync2-js JavaScript SDK 🚀

In order to provide easy access to all the features of zkSync Era, the `zksync2-js` JavaScript SDK was created,
which is made in a way that has an interface very similar to those of [ethers](https://docs.ethers.io/v6/). In
fact, `ethers` is a peer dependency of our library and most of the objects exported by `zksync2-js` (
e.g. `Wallet`, `Provider` etc.) inherit from the corresponding `ethers` objects and override only the fields that need
to be changed.

While most of the existing SDKs should work out of the box, deploying smart contracts or using unique zkSync features,
like account abstraction, requires providing additional fields to those that Ethereum transactions have by default.

The library is made in such a way that after replacing `ethers` with `zksync2-js` most client apps will work out of
box.

🔗 For a detailed walkthrough, refer to the [official documentation](https://era.zksync.io/docs/api/js/zksync2-js).

## 📌 Overview

To begin, it is useful to have a basic understanding of the types of objects available and what they are responsible for, at a high level:

-   `Provider` provides connection to the zkSync Era blockchain, which allows querying the blockchain state, such as account, block or transaction details,
    querying event logs or evaluating read-only code using call. Additionally, the client facilitates writing to the blockchain by sending
    transactions.
-   `Wallet` wraps all operations that interact with an account. An account generally has a private key, which can be used to sign a variety of
    types of payloads. It provides easy usage of the most common features.

## 🛠 Prerequisites

-   `node: >= 18` ([installation guide](https://nodejs.org/en/download/package-manager))
-   `ethers: ^6.7.1`

## 📥 Installation & Setup

```bash
yarn add zksync2-js
yarn add ethers@6 # ethers is a peer dependency of zksync2-js
```

## 📝 Examples

The complete examples with various use cases are available [here](https://github.com/zksync-sdk/zksync2-examples/tree/main/js).

### Connect to the zkSync Era network:

```ts
import { Provider, utils, types } from "zksync2-js";
import { ethers } from "ethers";

const provider = Provider.getDefaultProvider(types.Network.Goerli); // zkSync Era testnet (L2)
const ethProvider = ethers.getDefaultProvider("goerli"); // goerli testnet (L1)
```

### Get the latest block number

```ts
const blockNumber = await provider.getBlockNumber();
```

### Get the latest block

```ts
const block = await provider.getBlock("latest");
```

### Create a wallet

```ts
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const wallet = new Wallet(PRIVATE_KEY, provider, ethProvider);
```

### Check account balances

```ts
const ethBalance = await wallet.getBalance(); // balance on zkSync Era network

const ethBalanceL1 = await wallet.getBalanceL1(); // balance on goerli network
```

### Transfer funds

Transfer funds among accounts on L2 network.

```ts
const receiver = Wallet.createRandom();

const transfer = await wallet.transfer({
    to: receiver,
    token: utils.ETH_ADDRESS,
    amount: ethers.parseEther("1.0"),
});
```

### Deposit funds

Transfer funds from L1 to L2 network.

```ts
const deposit = await wallet.deposit({
    token: utils.ETH_ADDRESS,
    amount: ethers.parseEther("1.0"),
});
```

### Withdraw funds

Transfer funds from L2 to L1 network.

```ts
const withdrawal = await wallet.withdraw({
    token: utils.ETH_ADDRESS,
    amount: ethers.parseEther("1.0"),
});
```

## 🤝 Contributing

We welcome contributions from the community! If you're interested in contributing to the zksync2-js JavaScript SDK,
please take a look at our [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for guidelines and details on the process.

Thank you for making zksync2-js JavaScript SDK better! 🙌
