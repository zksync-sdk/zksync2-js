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

    protected prepareDeploymentArgs(args: any[]): {
        constructorArgs: any[],
        customData: { dependencies: BytesLike[], salt: BytesLike }
    } {
        let constructorArgs: any[] = [];
        let customData: { dependencies: BytesLike[], salt: BytesLike } = {
            dependencies: [],
            salt: ethers.ZeroHash
        };

        if (typeof args[0] === 'object' && ('dependencies' in args[0] || 'salt' in args[0])) {
            const options = args[0];

            if (options.dependencies) {
                if (Array.isArray(options.dependencies)) {
                    customData.dependencies = options.dependencies.map((dep: BytesLike) => dep);
                    constructorArgs = args.slice(1);
                } else {
                    throw new Error("Invalid 'dependencies' format. It should be an array of bytecodes.");
                }

                if (this.deploymentType === "create2" || this.deploymentType === "create2Account") {
                    if (options.salt) {
                        if (!options.salt.startsWith("0x") || options.salt.length !== 66) {
                            throw new Error("Invalid salt provided.");
                        }
                        customData.salt = options.salt;
                    } else {
                        throw new Error("Salt is required for CREATE2 deployment.");
                    }
                }
            } else if (this.deploymentType === "create2" || this.deploymentType === "create2Account") {
                if (options.salt) {
                    if (!options.salt.startsWith("0x") || options.salt.length !== 66) {
                        throw new Error("Invalid salt provided.");
                    }
                    customData.salt = options.salt;
                    constructorArgs = args.slice(1);
                } else {
                    throw new Error("Salt is required for CREATE2 deployment.");
                }
            } else {
                throw new Error("Invalid deployment options for the chosen deployment type.");
            }
        } else if((this.deploymentType === "create2" || this.deploymentType === "create2Account") &&
            !(typeof args[0] === 'object' && 'salt' in args[0])) {
            throw new Error("Salt is required for CREATE2 deployment.");
        } else {
            constructorArgs = args;
        }

        return { constructorArgs, customData };
    }



    override async getDeployTransaction(...args: any[]): Promise<ContractTransaction> {
        const {constructorArgs, customData} = this.prepareDeploymentArgs(args);

        // The overrides will be popped out in this call:
        const txRequest = await super.getDeployTransaction(...constructorArgs);
        // Removing overrides
        if (this.interface.deploy.inputs.length + 1 == constructorArgs.length) {
            constructorArgs.pop();
        }

        const bytecodeHash = hashBytecode(this.bytecode);
        const constructorCalldata = ethers.getBytes(this.interface.encodeDeploy(constructorArgs));
        const deployCalldata = this.encodeCalldata(customData.salt, bytecodeHash, constructorCalldata);

        const tx = {
            ...txRequest,
            to: CONTRACT_DEPLOYER_ADDRESS,
            data: deployCalldata,
            type: EIP712_TX_TYPE,
        };

        tx.customData ??= {};
        tx.customData.factoryDeps ??= customData.dependencies;
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
