# [0.4.0](https://github.com/zksync-sdk/zksync2-js/compare/v0.3.0...v0.4.0) (2023-12-01)


### Bug Fixes

* update contract ABI to align with `zksync core v18` ([f7d46f3](https://github.com/zksync-sdk/zksync2-js/commit/f7d46f3108c6bfbeba14464e73430e361363b949))
* resolve padding bugs in `createAccount` and `createAccount2` ([d1523fb](https://github.com/zksync-sdk/zksync2-js/commit/d1523fbbe4198f4a016d95955d6b61b13602bb44))
* add support for `Sepolia` testnet ([cfcd9db](https://github.com/zksync-sdk/zksync2-js/commit/cfcd9dbb9c6437cf9707f6ea793a6cf13e402a07))

### Features

*  add `Provider.getBytecodeByHash` and `Provider.getRawBlockTransactions` ([021ad49](https://github.com/zksync-sdk/zksync2-js/commit/021ad49bbcf857f1564f7eaf63c457320c503ece))



# [0.3.0](https://github.com/zksync-sdk/zksync2-js/compare/v0.2.2...v0.3.0) (2023-11-08)


### Bug Fixes

* resolved bug related to attaching contract to custom bridge ([a81e92c](https://github.com/zksync-sdk/zksync2-js/commit/a81e92ce00a315d349f16207f4cf126458dcd82a))

### Features

* add support for wETH bridges ([535e2f0](https://github.com/zksync-sdk/zksync2-js/commit/535e2f0a99dabfae355b1455cf828e3e16da4fa9))


# [0.2.2](https://github.com/zksync-sdk/zksync2-js/compare/v0.2.1...v0.2.2) (2023-11-01)


### Bug Fixes

* update `Log` format to allow `null` values in `Log.removed` ([1408c48](https://github.com/zksync-sdk/zksync2-js/commit/1408c4824d497ce8be2cf1aedf0d5c02641424d5))
* make `ContractFactory` generic ([a2e7b2c](https://github.com/zksync-sdk/zksync2-js/commit/a2e7b2c63943912a3bb61474211c8000bd0d1e5c))


# [0.2.1](https://github.com/zksync-sdk/zksync2-js/compare/v0.2.0...v0.2.1) (2023-10-24)


### Bug Fixes

* fix typing error related to `Provider.contracAddresses` ([b95c954](https://github.com/zksync-sdk/zksync2-js/commit/b95c954d783cf6e30d3d3032d8eef3dde172dff4))
* resolve error related to deployment when overrides parameter is used ([77f4835](https://github.com/zksync-sdk/zksync2-js/commit/77f4835d474842b2140072b51d3752aedbe3cb22))


# [0.2.0](https://github.com/zksync-sdk/zksync2-js/compare/v0.1.0...v0.2.0) (2023-10-20)


### Bug Fixes

* arrarify factory deps in `Provider.estimateGas` ([91e87a4](https://github.com/zksync-sdk/zksync2-js/commit/91e87a47587dac95bb2ed4d04acd8cb9f770babe))
* fix padding in `hashBytecode` ([38f2059](https://github.com/zksync-sdk/zksync2-js/commit/38f2059a33e08f079e1757de50434c7cd9c0a672))
* provide `ethers.Overrides` as last parameter in `ContractFactory.deploy` ([628b4c1](https://github.com/zksync-sdk/zksync2-js/commit/628b4c173b05371de298d8de40de9d5bc98fa941))
* provide option to specify salt and factory deps in `ContractFactory.deploy()` ([c7a0c9a](https://github.com/zksync-sdk/zksync2-js/commit/c7a0c9aeced4455cf2ca9959016c48567982e83c))


### Features

* add `AdapterL2.getDeploymentNonce` method ([b93e791](https://github.com/zksync-sdk/zksync2-js/commit/b93e7915de29965c1601857485b2a42cc6e1a116))
* add `utils.PAYMASTER_FLOW_ABI` ([a89208c](https://github.com/zksync-sdk/zksync2-js/commit/a89208c9a5a79a5e71d59638026db1fab40945e6))
* add ABI and typechain for `NonceHolder` contract ([462b01a](https://github.com/zksync-sdk/zksync2-js/commit/462b01ae71d99bb01344493026ef26c4bbf2109a))
* add account and contract deployment using CREATE2 opcode in `ContractFactory` ([16ba768](https://github.com/zksync-sdk/zksync2-js/commit/16ba768f16743a42cfd7237da2b8ffd7acbabdb3))

# 0.1.0 (2023-10-04)


### Bug Fixes

* resolve issues related to `TransactionResponse.wait()` and `TransactionResponse.waitFinalize()` ([aad269a](https://github.com/zksync-sdk/zksync2-js/commit/aad269aed6bfce5ca5b0a2c0a39ae5c2a5656f5c))


### Features

* migrate to ethers v6 ([75c14e9](https://github.com/zksync-sdk/zksync2-js/commit/75c14e92671b2545e4c78f0772eac02791550e4a))