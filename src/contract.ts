import { BytesLike, Contract, InterfaceAbi, Interface, ethers, ContractRunner, ContractTransaction } from 'ethers';
import {
    hashBytecode,
    CONTRACT_DEPLOYER,
    CONTRACT_DEPLOYER_ADDRESS,
    EIP712_TX_TYPE,
    getDeployedContracts,
    DEFAULT_GAS_PER_PUBDATA_LIMIT
} from './utils';
import { AccountAbstractionVersion, DeploymentType } from './types';
export { Contract } from 'ethers';

export class ContractFactory extends ethers.ContractFactory {
    readonly deploymentType: DeploymentType;

    constructor(
        abi: Interface | InterfaceAbi,
        bytecode: ethers.BytesLike,
        runner?: ContractRunner,
        deploymentType?: DeploymentType
    ) {
        super(abi, bytecode, runner);
        this.deploymentType = deploymentType || 'create';
    }

    private encodeCalldata(salt: BytesLike, bytecodeHash: BytesLike, constructorCalldata: BytesLike) {
        if (this.deploymentType == 'create') {
            return CONTRACT_DEPLOYER.encodeFunctionData('create', [salt, bytecodeHash, constructorCalldata]);
        } else if (this.deploymentType == 'createAccount') {
            return CONTRACT_DEPLOYER.encodeFunctionData('createAccount', [
                salt,
                bytecodeHash,
                constructorCalldata,
                AccountAbstractionVersion.Version1
            ]);
        } else {
            throw new Error(`Unsupported deployment type ${this.deploymentType}`);
        }
    }

    override async getDeployTransaction(...args: any[]): Promise<ContractTransaction> {
        // TODO (SMA-1585): Users should be able to provide the salt.
        let salt = '0x0000000000000000000000000000000000000000000000000000000000000000';

        // The overrides will be popped out in this call:
        const txRequest = await super.getDeployTransaction(...args);
        // Removing overrides
        if (this.interface.deploy.inputs.length + 1 == args.length) {
            args.pop();
        }

        // Salt argument is not used, so we provide a placeholder value.
        const bytecodeHash = hashBytecode(this.bytecode);
        const constructorCalldata = ethers.getBytes(this.interface.encodeDeploy(args));

        const deployCalldata = this.encodeCalldata(salt, bytecodeHash, constructorCalldata);

        const tx = {
            ...txRequest,
            to: CONTRACT_DEPLOYER_ADDRESS,
            data: deployCalldata,
            type: EIP712_TX_TYPE
        };

        txRequest.customData ??= {};
        txRequest.customData.factoryDeps ??= [];
        txRequest.customData.gasPerPubdata ??= DEFAULT_GAS_PER_PUBDATA_LIMIT;

        // The number of factory deps is relatively low, so it is efficient enough.
        if (!tx.customData.factoryDeps.includes(this.bytecode)) {
            tx.customData.factoryDeps.push(this.bytecode);
        }

        return tx;
    }

    override async deploy(...args: Array<any>): Promise<Contract> {
        const contract = await super.deploy(...args);

        const deployTxReceipt = await contract.deploymentTransaction().wait();

        const deployedAddresses = getDeployedContracts(deployTxReceipt).map((info) => info.deployedAddress);

        const contractWithCorrectAddress = new ethers.Contract(
            deployedAddresses[deployedAddresses.length - 1],
            contract.interface.fragments,
            contract.runner
        );

        contractWithCorrectAddress.deploymentTransaction = () => contract.deploymentTransaction();
        return contractWithCorrectAddress;
    }
}
