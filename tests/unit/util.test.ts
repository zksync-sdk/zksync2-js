import { expect } from "chai";
import { Provider, types, utils, Wallet } from "../../src";
import { ethers } from "ethers";

describe("utils", () => {
    describe("#applyL1ToL2Alias()", () => {
        it("should return the L2 contract address based on provided L1 contract address", async () => {
            const l1ContractAddress = "0x702942B8205E5dEdCD3374E5f4419843adA76Eeb";
            const l2ContractAddress = utils.applyL1ToL2Alias(l1ContractAddress);
            expect(l2ContractAddress).not.to.be.equal(
                "0x813A42B8205E5DedCd3374e5f4419843ADa77FFC",
            );
        });
    });

    describe("#undoL1ToL2Alias()", () => {
        it("should return the L1 contract address based on provided L2 contract address", async () => {
            const l2ContractAddress = "0x813A42B8205E5DedCd3374e5f4419843ADa77FFC";
            const l1ContractAddress = utils.undoL1ToL2Alias(l2ContractAddress);
            expect(l2ContractAddress).not.to.be.equal(
                "0x702942B8205E5dEdCD3374E5f4419843adA76Eeb",
            );
        });
    });
});
