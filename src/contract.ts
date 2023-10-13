import {
    BytesLike,
    Contract,
    InterfaceAbi,
    Interface,
    ethers,
    ContractRunner,
    ContractTransaction,
    BaseContract,
    ContractTransactionResponse,
} from "ethers";
import {
    hashBytecode,
    CONTRACT_DEPLOYER,
    CONTRACT_DEPLOYER_ADDRESS,
    EIP712_TX_TYPE,
    getDeployedContracts,
    DEFAULT_GAS_PER_PUBDATA_LIMIT,
} from "./utils";
import { AccountAbstractionVersion, DeploymentType } from "./types";
export { Contract } from "ethers";

export class ContractFactory extends ethers.ContractFactory {
    readonly deploymentType: DeploymentType;

    constructor(
        abi: Interface | InterfaceAbi,
        bytecode: ethers.BytesLike,
        runner?: ContractRunner,
        deploymentType?: DeploymentType,
    ) {
        super(abi, bytecode, runner);
        this.deploymentType = deploymentType || "create";
    }

    private encodeCalldata(
        salt: BytesLike,
        bytecodeHash: BytesLike,
        constructorCalldata: BytesLike,
    ): string {
        if (this.deploymentType === "create") {
            return CONTRACT_DEPLOYER.encodeFunctionData("create", [
                salt,
                bytecodeHash,
                constructorCalldata,
            ]);
        } else if (this.deploymentType === "createAccount") {
            return CONTRACT_DEPLOYER.encodeFunctionData("createAccount", [
                salt,
                bytecodeHash,
                constructorCalldata,
                AccountAbstractionVersion.Version1,
            ]);
        } else if (this.deploymentType === "create2") {
            return CONTRACT_DEPLOYER.encodeFunctionData("create2", [
                salt,
                bytecodeHash,
                constructorCalldata,
            ]);
        } else if (this.deploymentType === "create2Account") {
            return CONTRACT_DEPLOYER.encodeFunctionData("create2Account", [
                salt,
                bytecodeHash,
                constructorCalldata,
                AccountAbstractionVersion.Version1,
            ]);
        } else {
            throw new Error(`Unsupported deployment type ${this.deploymentType}`);
        }
    }

    override async getDeployTransaction(...args: any[]): Promise<ContractTransaction> {
        let salt = ethers.ZeroHash;
        let ars = args;
        if (this.deploymentType === "create2" || this.deploymentType === "create2Account") {
            salt = args[0] as string;
            if (!salt.startsWith("0x") || salt.length !== 66) {
                throw new Error("Invalid salt provided.");
            }
            ars = args.slice(1);
        }

        // The overrides will be popped out in this call:
        const txRequest = await super.getDeployTransaction(...ars);
        // Removing overrides
        if (this.interface.deploy.inputs.length + 1 == ars.length) {
            ars.pop();
        }

        // Salt argument is not used, so we provide a placeholder value.
        const bytecodeHash = hashBytecode(this.bytecode);
        const constructorCalldata = ethers.getBytes(this.interface.encodeDeploy(ars));

        const deployCalldata = this.encodeCalldata(salt, bytecodeHash, constructorCalldata);

        const tx = {
            ...txRequest,
            to: CONTRACT_DEPLOYER_ADDRESS,
            data: deployCalldata,
            type: EIP712_TX_TYPE,
        };

        tx.customData ??= {};
        tx.customData.factoryDeps ??= [];
        tx.customData.gasPerPubdata ??= DEFAULT_GAS_PER_PUBDATA_LIMIT;

        // The number of factory deps is relatively low, so it is efficient enough.
        if (!tx.customData || !tx.customData.factoryDeps.includes(this.bytecode)) {
            tx.customData.factoryDeps.push(this.bytecode);
        }

        return tx;
    }

    override async deploy(...args: Array<any>) {
        const contract = await super.deploy(...args);
        const deployTxReceipt = await this.runner?.provider?.getTransactionReceipt(
            // @ts-ignore
            contract.deploymentTransaction().hash,
        );

        // @ts-ignore
        const deployedAddresses = getDeployedContracts(deployTxReceipt).map(
            (info) => info.deployedAddress,
        );

        const contractWithCorrectAddress = new ethers.Contract(
            deployedAddresses[deployedAddresses.length - 1],
            contract.interface.fragments,
            contract.runner,
        ) as BaseContract & { deploymentTransaction(): ContractTransactionResponse } & Omit<
                BaseContract,
                keyof BaseContract
            >;

        // @ts-ignore
        contractWithCorrectAddress.deploymentTransaction = () =>
            contract.deploymentTransaction();
        return contractWithCorrectAddress;
    }
}
