# Changelog

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
