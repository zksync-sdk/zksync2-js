# Changelog

## [0.17.0](https://github.com/zksync-sdk/zksync2-js/compare/v0.16.0...v0.17.0) (2023-12-06)

### Features

* add `Provider.getBytecodeByHash` and `Provider.getRawBlockTransactions` ([125a092](https://github.com/zksync-sdk/zksync2-js/commit/125a092983e1fda7f7aab5daef6a8fb0a76f2c38))


## [0.16.0](https://github.com/zksync-sdk/zksync2-js/compare/v0.15.5...v0.16.0) (2023-11-01)

### Features

* add `Provider.estimateFee` method ([e4466d3](https://github.com/zksync-sdk/zksync2-js/commit/e4466d30bbb3b5692f171b65effa03766a21c4b1))
* provide account and contract deployment using CREATE2 opcode ([97a1fc2](https://github.com/zksync-sdk/zksync2-js/commit/97a1fc2357ccbfeb5673c5ea8c540cf783a79b75))
* add `AdapterL2.getDeploymentNonce` ([9ad8265](https://github.com/zksync-sdk/zksync2-js/commit/9ad8265edb2e1c850faea94ace4d415bdd9b1fe8))
* add `INonceHolder` ABI and typechain ([7433697](https://github.com/zksync-sdk/zksync2-js/commit/743369718157b8e7a7ee7e89315dc933560bbf48))


### Bug Fixes

* resolved wrong types in `types.Fee` ([8f1bf71](https://github.com/zksync-sdk/zksync2-js/commit/8f1bf71910f082f06623ac31d13c4eef1d1770a1))


## [0.15.5](https://github.com/zksync-sdk/zksync2-js/compare/v0.15.4...v0.15.5) (2023-10-02)



### Bug Fixes

* handle errors from `wETHL1` and `wETHL2` bridges ([a3cb054]((https://github.com/zksync-sdk/zksync2-js/commit/a3cb0549c2ff9712da53c0188d1251a2e109cc11)))


### Features

* make input optional in `create2Address` ([8745cfd](https://github.com/zksync-sdk/zksync2-js/commit/8745cfd97cb17e5d590afbd4f4551b4335006765))


## 0.15.4 (2023-07-25)


### Bug Fixes

* allow `null` for `txIndexInL1Batch` in formatter

## 0.15.3 (2023-07-25)


### Bug Fixes

* Fix getting receipt for transactions rejected in state keeper
* make new fields optional in SDK

## 0.15.2 (2023-07-06)


### Features

* Integrate WETH bridge into server & SDK
* add `tx_index_in_l1_batch` field to `L2ToL1Log` 
* add `gas_per_pubdata` to `zks_getTransactionDetails`

## 0.15.1 (2023-04-24)


### Bug Fixes

* add coefficient to gas limit + method for full fee estimation

## 0.15.0 (2023-04-20)


### ⚠ BREAKING CHANGES

* Implement WETH bridge, support custom bridge in sdk, bootloader gas calculation fix

### Features

* Implement WETH bridge, support custom bridge in sdk, bootloader gas calculation fix 


### Bug Fixes

* Fix `getSignInput` when gas parameters are 0 

## 0.14.4 (2023-04-13)


### Features

* add `getL1BatchDetails` method to js SDK 
* extend `BlockDetails` type to include `l1BatchNumber`
